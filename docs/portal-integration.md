# Student Portal Integration (Single Sign-On)

Students open the Digital Passport from the MCU Student Portal and are signed in automatically with their
MCU Microsoft 365 account. They do not see a second sign-in page.

## How it works

1. The student is already signed in to the Student Portal with their MCU Microsoft 365 account.
2. They click the **Digital Passport** link in the portal (`?from=portal`).
3. The Passport has no session yet, so it sends the browser to the backend (`/api/auth/login?sso=1`), which
   redirects to Microsoft **without the account picker**. Microsoft recognises the existing session and sends
   the student straight back, signed in. No password or click is needed.
4. The backend issues the app session (httpOnly cookie) and the student lands on their dashboard, or on the
   page given in `returnTo`.

If there is no Microsoft session, Microsoft shows its normal sign-in page once. Students who open the Passport
directly (not from the portal) see the **Sign in with Microsoft** page.

## Link for the portal team

```
https://<passport-site>/?from=portal
```

Optional parameters:

| Parameter    | Example                                 | Purpose                                                   |
| ------------ | --------------------------------------- | --------------------------------------------------------- |
| `login_hint` | `login_hint=juan.dc@student.mcu.edu.ph` | The student's email. Microsoft skips the account picker. |
| `returnTo`   | `returnTo=/student/qr`                  | Open a specific page after sign-in. Relative paths only. |

Example: a "Show my QR pass" link in the portal:

```
https://<passport-site>/?from=portal&returnTo=/student/qr
```

## Accepted accounts

| Account               | Who               | Default role                                                          |
| --------------------- | ----------------- | --------------------------------------------------------------------- |
| `@student.mcu.edu.ph` | Students          | **Student** automatically                                             |
| `@mcu.edu.ph`         | Faculty and staff | **None.** An IT Administrator assigns `Organizer`, `Admin` or `ITAdmin` in the system |

Any other account (personal Microsoft accounts, other organizations) is refused by the backend at sign-in.
Staff without a role see a "No access yet" page that tells them to contact SASD/ICT.

### One tenant or two?

- **Both domains in the same Microsoft 365 tenant** (recommended, most common): set `ENTRA_TENANT_ID` and leave
  `ENTRA_ALLOWED_TENANT_IDS` unset.
- **Students in a separate tenant**: make the app registration **multi-tenant**, grant admin consent in the
  student tenant, and set `ENTRA_ALLOWED_TENANT_IDS=<staff tenant id>,<student tenant id>`.

To check: in the Entra admin center, open **Settings → Domain names**. If both `mcu.edu.ph` and
`student.mcu.edu.ph` are listed, they are in the same tenant.

All settings are in `backend/.env`. The frontend needs no Microsoft settings (see [authentication.md](authentication.md)).

## Requirements

- **The Student Portal must sign in with Microsoft 365 / Entra ID** (the MCU tenant or tenants above). If the
  portal has its own separate login, it must first be connected to Entra ID (OpenID Connect or SAML) before single
  sign-on can work.
- **Entra app registration**, **Web** platform, with the redirect URI `https://<passport-site>/auth/callback`
  (and `http://localhost:5173/auth/callback` for development), plus a client secret.
- **Roles** are managed in the Digital Passport itself (no Entra app roles). See [authentication.md](authentication.md#roles).

## Signing out

Signing out of the Passport ends the app session and the Microsoft session in that browser, so the next person on
a shared computer is not signed in automatically.

## Testing in development

With `VITE_DEV_MOCK_ROLE` set in `frontend/.env.local`, `http://localhost:5173/?from=portal` simulates single
sign-on with a mock user. Remove that line (and run the backend) to test the real flow.
