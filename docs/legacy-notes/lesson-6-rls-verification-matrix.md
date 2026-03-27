# Lesson 6 RLS Verification Matrix (`L6-RLS-01` + `L6-RLS-02`)

Date: 2026-03-21  
Scope: structured read/write verification for sensitive tables using current SQL migration baseline (`supabase/migrations/*.sql`) plus automated deny-path checks in `src/utils/rlsPolicyMatrix.test.js` (including storage materials write tightening in `L6-RLS-02`).

## Actor legend
- `anon`: unauthenticated API caller.
- `authenticated (non-owner)`: signed-in user without ownership for target row.
- `authenticated owner/self`: signed-in user acting on owned/self rows.
- `admin aal1 (cross-tenant)`: admin role, but session not elevated to `aal2`.
- `admin aal2`: admin role with elevated session.
- `service_role`: server-side service key (bypasses RLS by design).

## Read matrix
| Table | anon | authenticated (non-owner) | authenticated owner/self | admin aal1 (cross-tenant) | admin aal2 | service_role |
| --- | --- | --- | --- | --- | --- | --- |
| `public.user_roles` | deny | deny | allow (own role) | deny | allow (all rows) | allow |
| `public.profiles` | allow | allow | allow | allow | allow | allow |
| `public.courses` | deny | deny | allow | deny | allow | allow |
| `public.modules` | deny | deny | allow | deny | allow | allow |
| `public.materials` | deny | allow | allow | allow | allow | allow |
| `storage.objects` (`materials` bucket) | deny | allow | allow | allow | allow | allow |
| `public.activity_logs` | deny | deny | n/a | deny | allow | allow |
| `public.contact_messages` | deny | deny | n/a | deny | allow | allow |
| `public.system_settings` | allow | allow | allow | allow | allow | allow |
| `public.security_events` | deny | deny | deny | deny | deny | allow |
| `public.security_alert_incidents` | deny | deny | deny | deny | deny | allow |

## Write matrix
| Table | anon | authenticated (non-owner) | authenticated owner/self | admin aal1 (cross-tenant) | admin aal2 | service_role |
| --- | --- | --- | --- | --- | --- | --- |
| `public.user_roles` | deny | deny | deny | deny | allow (`insert/update/delete`) | allow |
| `public.profiles` | deny | deny | allow (`insert/update own`) | deny | allow (`update any`) | allow |
| `public.courses` | deny | deny | allow (`insert/update/delete own`) | deny | allow (`all`) | allow |
| `public.modules` | deny | deny | allow (`insert/update/delete own`) | deny | allow (`all`) | allow |
| `public.materials` | deny | deny | allow (`insert/update/delete own`) | deny | allow (`update/delete any`) | allow |
| `storage.objects` (`materials` bucket) | deny | deny | allow (`insert/update/delete own`) | deny | allow (`insert/update own + delete any`) | allow |
| `public.activity_logs` | deny | allow (`insert`) | allow (`insert`) | allow (`insert`) | allow (`insert` + read) | allow |
| `public.contact_messages` | allow (`insert` constrained) | allow (`insert` constrained) | allow (`insert` constrained) | allow (`insert` constrained) | allow (`insert` constrained + read) | allow |
| `public.system_settings` | deny | deny | deny | deny | allow (`insert/update`) | allow |
| `public.security_events` | deny | deny | deny | deny | deny | allow |
| `public.security_alert_incidents` | deny | deny | deny | deny | deny | allow |

## Negative-path validation (mandatory deny checks)
Automated in `src/utils/rlsPolicyMatrix.test.js`:
- admin cross-tenant policies require `public.is_admin_aal2()` (validates `admin aal1` deny for privileged paths).
- stale broad policies remain dropped:
  - `public.user_roles`: legacy `Admins can * roles` policy names.
  - `public.system_settings`: `Authenticated users can update/insert settings`.
  - `storage.objects`: `Authenticated users can upload/update/delete materials`.
- `public.contact_messages` read path remains admin-only (`Admins can read contact messages` + `is_admin_aal2`).
- owner-scoped write checks remain present for `courses/modules/materials` (`auth.uid() = created_by` patterns) and `storage.objects` materials `insert/update` (`owner = auth.uid()`).
- `public.security_events` and `public.security_alert_incidents` stay closed to anon/authenticated clients (no client policies).

## Known residual risk after verification
- `L6-RLS-02` closes the previously tracked residual risk for broad authenticated `storage.objects` `materials`-bucket `insert/update` writes by enforcing owner-scoped policies.

## Validation for this slice
- `npm.cmd run test` PASS (2026-03-21, 14 files / 93 tests)
- `npm.cmd run build` PASS (2026-03-21)
- No hosted rollout actions executed (`no supabase db push`).
