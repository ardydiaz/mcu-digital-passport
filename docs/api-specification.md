# API Specification

Base URL: `/api`. Every endpoint requires `Authorization: Bearer <token>` (see [authentication.md](authentication.md)).

Responses use `{ "success": true, "data": ... }` or `{ "success": false, "message": "...", "details"?: ... }`.

> **Status:** authentication, RBAC and request validation are in place for every endpoint below. Endpoints marked
> **501** return `501 Not Implemented` until the database schema and business logic are built.

## Auth

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/health` | `system:health` | Health check |
| GET | `/auth/me` | `profile:read:own` | Signed-in user's profile, roles and permissions |

## Passports (student's own)

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/passports/me` | `passport:read:own` | Own digital passport: profile, stamps, progress | 501 |
| POST | `/passports/me/qr-token` | `qr:generate:own` | New short-lived, server-signed QR token | 501 |
| GET | `/passports/me/notifications` | `notifications:read:own` | Credited experiences and milestones | 501 |
| GET | `/passports/:studentId` | `passports:read` | Any student's passport (SASD) | 501 |

## Bucket list

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/bucket-list` | `bucketlist:read` | Pre-identified experiences | 501 |
| GET | `/bucket-list/me` | `bucketlist:read:own` | Own progress: completed, remaining, % | 501 |
| POST | `/bucket-list` | `bucketlist:manage` | Create experience `{ title, description?, requiredCount?, isActive? }` | 501 |
| PATCH | `/bucket-list/:id` | `bucketlist:manage` | Update experience | 501 |
| DELETE | `/bucket-list/:id` | `bucketlist:manage` | Remove experience | 501 |

## Activities

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/activities` | `activities:read` | List (`page`, `pageSize`, `search`) | 501 |
| GET | `/activities/:id` | `activities:read` | Details | 501 |
| POST | `/activities` | `activities:create` | Create `{ title, startsAt, endsAt, description?, venue?, bucketListItemId?, capacity? }` | 501 |
| PATCH | `/activities/:id` | `activities:update` | Update (organizers: assigned activities only) | 501 |
| DELETE | `/activities/:id` | `activities:delete` | Delete (SASD) | 501 |

## Attendance

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| POST | `/attendance/scan` | `attendance:scan` | Record attendance `{ activityId, qrToken }`; duplicates rejected | 501 |
| GET | `/attendance/me` | `attendance:read:own` | Own verified activity history | 501 |
| GET | `/attendance` | `attendance:read` | Records (`activityId`, `page`, `pageSize`) | 501 |
| POST | `/attendance/:id/validate` | `attendance:validate` | Confirm participation before crediting | 501 |
| POST | `/attendance/manual` | `attendance:manual` | Manual credit `{ studentId, activityId, justification }` (min. 10 chars) | 501 |
| POST | `/attendance/:id/invalidate` | `attendance:manual` | Invalidate `{ justification }` | 501 |

## Students (SASD)

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/students` | `students:read` | List (`college`, `program`, `search`, `page`, `pageSize`) | 501 |
| GET | `/students/:studentId` | `students:read` | Details | 501 |

## Reports (SASD)

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/reports/participation` | `reports:generate` | Excel/CSV (`format=xlsx\|csv`, `studentId`, `college`, `program`, `activityId`, `from`, `to`) | 501 |

## Users (IT)

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/users` | `users:read` | List users (`search`, `role=Organizer\|none`, `accountType`, `page`, `pageSize`) | ✓ |
| GET | `/users/:id` | `users:read` | User details with roles | ✓ |
| PUT | `/users/:id/roles` | `users:manage` | Set roles `{ roles: ["Organizer", ...], justification? }` (replaces all; 409 if it would remove the last IT Admin) | ✓ |
| PATCH | `/users/:id/status` | `users:manage` | Activate / deactivate `{ isActive, justification? }` (409 for yourself or the last IT Admin) | ✓ |

## Audit and imports

| Method | Path | Permission | Description | |
| --- | --- | --- | --- | --- |
| GET | `/audit` | `audit:read` | Audit log (`action`, `from`, `to`, `page`, `pageSize`) | 501 |
| POST | `/imports/students` | `imports:run` | Import enrolled students | 501 |
