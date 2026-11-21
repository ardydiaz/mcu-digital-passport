# Authentication and Access Control

The **backend** signs users in with **Microsoft Entra ID (Microsoft 365)** and then issues its **own session JWT**
in an **httpOnly cookie**. Every API endpoint requires that JWT and applies **role-based access control (RBAC)**.
The frontend never handles Microsoft tokens and needs no Entra settings.

## Sign-in flow (backend, authorization code flow + PKCE + client secret)

```
Browser                      Backend                                   Microsoft
  │ Sign in with Microsoft     │                                          │
  │──GET /api/auth/login──────▶│ state + PKCE → short-lived tx cookie     │
  │◀─302 to Microsoft──────────│                                          │
  │──────────────────────────────── sign in with MCU account ───────────▶│
  │◀──────────────────────────────── 302 /auth/callback?code&state ──────│
  │──GET /auth/callback───────▶│ check state, redeem code (client secret)─▶│
  │                            │ check tenant + @student.mcu.edu.ph /     │
  │                            │ @mcu.edu.ph, resolve roles               │
  │◀─302 to app + Set-Cookie───│ mcu_session = app JWT (httpOnly, 8 h)    │
  │──GET /api/... (cookie)────▶│ authenticateJWT → authorize → handler    │
```

Only three endpoints are public, because the user has no session yet: `GET /api/auth/login`,
`GET /auth/callback` (the `ENTRA_REDIRECT_URI` path) and `POST /api/auth/logout`.
Everything else under `/api`, including the health check and unknown URLs, requires the session JWT.

## Request flow (every protected request)

```
Cookie: mcu_session=<app JWT>      (or Authorization: Bearer <app JWT> for non-browser clients)
        │
        ▼
1. authenticateJWT (app.js, runs before every /api route)
   - signature valid (SESSION_JWT_SECRET), not expired, issued by this backend
   - email domain is @student.mcu.edu.ph or @mcu.edu.ph
   → req.user = { oid, email, roles, permissions, ... }
        │
        ▼
2. authorize(PERMISSION) (on each route)
   - the user's roles must grant the permission
        │
        ▼
3. validate(schema) → handler
```

| Result | Status |
| --- | --- |
| No session, malformed, tampered, expired | `401 Unauthorized` |
| Valid session, but non-MCU email domain, missing permission, or cross-site request | `403 Forbidden` |
| Invalid request body or query | `400 Bad Request` |

**Protections:** httpOnly cookie (JavaScript can't read the token), `SameSite=Lax` + Origin check on
POST/PUT/PATCH/DELETE (CSRF), `state` + PKCE on the Microsoft round trip, safe `returnTo` paths only
(no open redirects), and the tenant and domain checked at sign-in and again on every request.

## Roles

Roles are **managed in the system** (the `user_roles` table), **not in Microsoft Entra**. Microsoft only proves
who the user is; any roles in the Microsoft token are ignored.

| Role | Who | Default |
| --- | --- | --- |
| `Student` | Students | Given automatically to a new `@student.mcu.edu.ph` account at first sign-in |
| `Organizer` | Activity organizers | Assigned by an IT Administrator |
| `Admin` | SASD Administrators | Assigned by an IT Administrator |
| `ITAdmin` | IT Administrators: **full access** (every permission, every dashboard) | Assigned by an IT Administrator (the first one with the command below) |

- Staff accounts (`@mcu.edu.ph`) start with **no role**. They can sign in and see a "No access yet" page.
- Roles and the active flag are read from the database on **every request**, so a role change or deactivation
  applies immediately, without signing in again.
- Every change is recorded in `audit_logs` (who, when, before/after, justification).
- The last active IT Administrator cannot be removed or deactivated, so the system can't be locked out.

### Managing roles

In the app (API, IT Administrator):

| Request | Purpose |
| --- | --- |
| `GET /api/users?role=none` | Users waiting for a role (`role=Organizer`, `search=`, `accountType=staff` also work) |
| `PUT /api/users/:id/roles` `{ "roles": ["Organizer"], "justification": "..." }` | Set a user's roles (replaces all) |
| `PATCH /api/users/:id/status` `{ "isActive": false, "justification": "..." }` | Deactivate / reactivate |

From the command line (needed once, to create the **first IT Administrator**; the person must have signed in once):

```bash
cd backend
npm run user:role -- juan.dc@mcu.edu.ph ITAdmin            # add a role
npm run user:role -- juan.dc@mcu.edu.ph Organizer --remove # remove a role
npm run user:role -- juan.dc@mcu.edu.ph                    # show roles
```

## Permissions

Routes never check roles directly. They require **permissions**, and
[`backend/src/config/permissions.js`](../backend/src/config/permissions.js) is the one place that maps roles to
permissions. To change who can do what, edit that file.

| Permission (ITAdmin has ALL of them) | Student | Organizer | Admin (SASD) | ITAdmin |
| --- | :-: | :-: | :-: | :-: |
| `profile:read:own`, `system:health` | ✓ | ✓ | ✓ | ✓ |
| `passport:read:own`, `qr:generate:own`, `bucketlist:read:own`, `attendance:read:own`, `notifications:read:own` | ✓ | | | ✓ |
| `activities:read` | ✓ | ✓ | ✓ | ✓ |
| `bucketlist:read` | ✓ | ✓ | ✓ | ✓ |
| `activities:create`, `activities:update` | | ✓ | ✓ | ✓ |
| `attendance:scan`, `attendance:read`, `attendance:validate` | | ✓ | ✓ | ✓ |
| `activities:delete`, `attendance:manual` | | | ✓ | ✓ |
| `students:read`, `passports:read`, `bucketlist:manage`, `reports:generate` | | | ✓ | ✓ |
| `audit:read`, `imports:run`, `users:read` | | | ✓ | ✓ |
| `users:manage`, `settings:manage` | | | | ✓ |

"Own" permissions always use the signed-in user from the token, never an id from the request, so a student
can only ever see their own records.

## Adding a new endpoint

```js
import { authorize } from '../../middleware/authorizePermission.js';
import { PERMISSIONS as P } from '../../config/permissions.js';

router.post('/', authorize(P.ACTIVITIES_CREATE), validate({ body: schema }), handler);
```

- Authentication is already applied to all of `/api`. Do not add it per route.
- Every route **must** have `authorize(...)` (or `authorizeRole(...)`). The test suite lists every route and
  fails if one is missing.

## Configuration (backend `.env`)

| Variable | Purpose |
| --- | --- |
| `ENTRA_TENANT_ID` | MCU tenant id |
| `ENTRA_CLIENT_ID` | App registration client id |
| `ENTRA_SECRET_ID` (or `ENTRA_CLIENT_SECRET`) | Client secret **value** (not the "Secret ID" column) |
| `ENTRA_REDIRECT_URI` | Web redirect URI, e.g. `http://localhost:5173/auth/callback` |
| `ENTRA_ALLOWED_TENANT_IDS` | Only if students and staff are in separate tenants: both tenant ids |
| `ALLOWED_EMAIL_DOMAINS` | `student.mcu.edu.ph,mcu.edu.ph` |
| `STUDENT_EMAIL_DOMAIN` | `student.mcu.edu.ph` (default Student role) |
| `SESSION_JWT_SECRET` | Signs the session JWT. Long random string; changing it signs everyone out |
| `SESSION_TTL_HOURS` | Session length (default 8) |
| `FRONTEND_URL` | Where users return after sign-in (default: first `CORS_ORIGIN`) |

### Entra app registration

- Platform: **Web** (not "Single-page application"), redirect URI = `ENTRA_REDIRECT_URI`.
- Certificates & secrets: create a client secret and copy its **Value** into `ENTRA_SECRET_ID`.
- No app roles are needed in Entra: roles are managed in the system (see **Roles** above).
- Token configuration → **Add optional claim** → token type **ID** → **`login_hint`**. Sign-out then signs out
  exactly the account that used the app. Without it, Microsoft asks "Which account do you want to sign out of?"
  when several accounts are signed in to the browser.

### Development

The Vite dev server forwards `/api` and `/auth/callback` to the backend (`frontend/vite.config.js`), so the
frontend and API share one origin and the cookie works. Run both `npm run dev` (frontend) and `npm run dev`
(backend). `VITE_DEV_MOCK_ROLE` in `frontend/.env.local` bypasses the backend with a mock user. Remove it to test
real sign-in.

## Tests

`npm test` in `backend/` uses a fake Microsoft and checks that:

- only the three sign-in endpoints are public; every other route returns `401` without a session and declares
  a permission;
- the full flow works (login → callback → httpOnly cookie → API), and non-MCU accounts, other tenants, state
  mismatches, open redirects and cross-site requests are refused;
- tampered and expired sessions get `401`, and each role can reach exactly the endpoints in the matrix above.
