# Admin 2FA Rollout Strategy (`L6-2FA-01`)

Last updated: 2026-03-19

## 1) Purpose
This document defines the chosen 2FA strategy for admin users in StudyHub.

Goal:
- require stronger authentication for privileged admin access,
- avoid accidental admin lockout during rollout,
- keep the implementation aligned with the current Supabase Auth feature set and the existing StudyHub architecture.

## 2) Current Project State
Current auth shape in the repo:
- login uses `supabase.auth.signInWithPassword()` in `src/services/authService.js`,
- Google OAuth login is also enabled in `src/services/authService.js`,
- admin access is currently decided by `user_roles.role = 'admin'`,
- `/admin.html` protection is frontend-driven via `isAdmin()` in `src/pages/admin/admin.js`,
- admin mutations (`create-user`, `update-user`, `delete-user`) already go through authenticated Edge Functions that check the caller's admin role.

Current MFA state in local Supabase config:
- `supabase/config.toml` already contains an `[auth.mfa]` section,
- `[auth.mfa.totp]` currently has `enroll_enabled = false` and `verify_enabled = false`,
- phone MFA is also disabled,
- WebAuthn is only commented out in config and is not part of the current application flow.

## 3) Official Supabase Capability Snapshot
Official Supabase docs reviewed on 2026-03-19:
- MFA overview: Supabase Auth currently exposes enrollment, challenge/verify, factor listing, and AAL-based enforcement patterns for app MFA.
- Supported factors in the JavaScript MFA API: `TOTP` and `phone`; recovery codes are not supported, but multiple factors per user are supported.
- TOTP enrollment and login challenge use `supabase.auth.mfa.enroll()`, `challenge()`, `verify()`, or `challengeAndVerify()`.
- After MFA enrollment/verification, the session's authenticator assurance level is promoted to `aal2`, and Supabase documents using the JWT `aal` claim for authorization rules.
- Supabase also documents server-side admin MFA APIs under `supabase.auth.admin`, including deleting a factor for a user from a trusted server context.

Primary sources:
- https://supabase.com/docs/guides/auth/auth-mfa
- https://supabase.com/docs/guides/auth/auth-mfa/totp
- https://supabase.com/docs/reference/javascript/auth-mfa-api
- https://supabase.com/docs/reference/javascript/auth-mfa-enroll
- https://supabase.com/docs/reference/javascript/auth-admin-mfa-deletefactor
- https://supabase.com/docs/reference/javascript/admin-api

Inference from the official docs:
- Supabase does not provide a built-in "admin-only MFA toggle" for app users.
- The correct StudyHub pattern is therefore custom role-based enforcement: `admin role` + `aal2` for privileged surfaces.

## 4) Chosen Strategy
Chosen second factor:
- `TOTP` only for the first rollout.

Chosen enforcement scope:
- require `aal2` for admin-only surfaces and privileged admin mutations,
- do not require `aal2` for normal student/course/material browsing,
- keep the scope truly admin-only.

Chosen rollout model:
1. document and prepare the flow,
2. enable TOTP support in Supabase,
3. add enrollment and challenge UI,
4. hard-enforce `aal2` on admin routes/APIs only after recovery and backup rules are in place.

## 5) Why TOTP First
Why TOTP is the recommended first factor:
- it is directly supported by the current documented JavaScript MFA API,
- it does not require SMS provider setup,
- it fits the current project better than phone MFA because phone login/MFA is disabled in local config,
- it keeps the initial rollout smaller and less operationally expensive.

Why not phone MFA first:
- phone MFA would require SMS provider configuration and delivery reliability work,
- the project currently has phone MFA disabled,
- this would add more environment/secrets/ops work than the admin-only requirement needs.

Why not WebAuthn first:
- the current StudyHub codebase has no WebAuthn flow yet,
- the active documented JavaScript MFA surface in the reviewed Supabase docs is centered on TOTP and phone,
- using TOTP first reduces implementation and rollout risk.

## 6) Enforcement Design
### 6.1 Frontend gating
For admin users:
- after first-factor sign-in, check role and AAL before showing privileged admin UI,
- if `role !== admin`, keep the current denial flow,
- if `role === admin` and `aal2`, continue normally,
- if `role === admin` and MFA is enrolled but not verified (`currentLevel = aal1`, `nextLevel = aal2`), redirect to a 2FA challenge screen,
- if `role === admin` and no verified factor exists, redirect to a 2FA enrollment/setup screen before admin access is granted.

Recommended client API:
- `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- `supabase.auth.mfa.listFactors()`

### 6.2 Backend / Edge Function enforcement
Admin Edge Functions must not rely only on `role = admin`.

Chosen rule for `create-user`, `update-user`, `delete-user` and future admin-sensitive functions:
- require authenticated admin user,
- require session `aal = aal2` before privileged admin mutation is allowed.

Implementation note:
- this should be enforced server-side from the JWT / verified auth context, not only in browser code.

### 6.3 Data-layer enforcement
Frontend-only checks are not sufficient for long-term protection.

For `L6-2FA-02`, review whether the current admin-only reads should also enforce `aal2`, especially for:
- `profiles`
- `user_roles`
- `activity_logs`
- any future admin-only settings or moderation tables

This may require restrictive RLS updates or moving some admin reads behind server-side endpoints.

## 7) Enrollment And Challenge UX
Chosen UX pattern:
- place enrollment and factor management in a user-controlled security area, most likely `profile.html`,
- add a dedicated admin 2FA gate screen for post-login challenge/enrollment decisions,
- keep `/admin.html` inaccessible until the gate finishes successfully.

Minimum enrollment flow:
1. Start TOTP enrollment with `supabase.auth.mfa.enroll({ factorType: 'totp' })`.
2. Show QR code and manual secret fallback.
3. Verify with user-entered code via `challenge()` + `verify()` or `challengeAndVerify()`.
4. Refresh/update session state and redirect back to the intended admin destination.

Minimum challenge flow:
1. Detect `role = admin` and `nextLevel = aal2`.
2. List available verified factors.
3. Prompt for TOTP code.
4. Verify and continue to admin destination only after success.

## 8) Recovery And Lockout Policy
This rollout must avoid single-device lockout.

Chosen recovery policy:
- every long-term admin should enroll at least two verified TOTP factors before hard enforcement is considered complete,
- keep at least two admin-capable accounts active during rollout,
- do not hard-enforce admin MFA if only one admin account can recover the environment.

Trusted recovery path:
- use server-only admin MFA recovery operations if an admin loses device access,
- recovery must run from a trusted server context with `service_role`,
- browser code must never receive the `service_role` key.

Recovery implementation candidate:
- add a privileged recovery/admin function that can remove a factor using the server-side admin MFA API after an explicit identity verification process.

## 9) Rollout Phases For `L6-2FA-02`
### Phase A: Enable provider capability
- turn on TOTP enrollment and verification in `supabase/config.toml` for local/dev,
- mirror that setting in the hosted Supabase project configuration.

### Phase B: Add client MFA service and screens
- add a dedicated MFA service wrapper around Supabase MFA calls,
- add enrollment UI,
- add challenge UI,
- add factor listing / unenroll management UI with guardrails.

### Phase C: Enforce on admin entry
- gate `/admin.html` on `role + aal`,
- preserve a clear redirect target so admins return to the requested admin page after successful challenge.

### Phase D: Enforce on privileged operations
- require `aal2` in admin Edge Functions,
- review whether admin-only read paths also need server/RLS enforcement.

### Phase E: Recovery and rollout completion
- validate backup-factor policy,
- document recovery runbook,
- test lost-device/admin-recovery scenarios before calling rollout complete.

## 10) Affected Files For Future Implementation
Likely affected areas in `L6-2FA-02`:
- `supabase/config.toml`
- `src/services/authService.js`
- `src/services/supabaseClient.js`
- `src/pages/login/login.js`
- `src/pages/profile/profile.js`
- `src/pages/admin/admin.js`
- `src/pages/admin/adminService.js`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/update-user/index.ts`
- `supabase/functions/delete-user/index.ts`

Likely new files:
- `src/services/mfaService.js`
- `src/pages/mfa/*` or equivalent admin 2FA gate modules
- optional recovery/admin maintenance function for factor removal

## 11) Done Criteria For `L6-2FA-02`
Implementation should not be considered done until:
- TOTP is enabled in the intended environments,
- admin users can enroll and verify TOTP successfully,
- admin sign-in path correctly challenges when `aal2` is required,
- admin-sensitive Edge Functions reject `aal1` admin sessions,
- recovery/fallback handling is documented and tested,
- at least one targeted validation path covers enrollment and admin re-entry after MFA.
