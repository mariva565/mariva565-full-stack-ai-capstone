# Security Observability Baseline (`L6-OBS-01`)

Last updated: 2026-03-20

## 1) Purpose
This document defines the minimum security-event inventory, target sink, ownership model, and retention rules for StudyHub.

Goal:
- stop treating security telemetry as isolated implementation details,
- give the team one source of truth for what should be captured,
- prepare a safe path for centralized alerting in `L6-OBS-02`.

Operational companion:
- `docs/security-alerting-runbook.md`

## 2) Decision Summary
Chosen centralized ingestion path:
- browser and edge-function security events should converge into one server-side ingestion flow,
- preferred implementation path: `security-event-ingest` Edge Function -> `security_events` storage/table in Supabase.

Implementation update (2026-03-20, `L6-OBS-03`):
- centralized sink is now implemented with `public.security_events` and `public.security_alert_incidents`,
- browser telemetry now forwards sanitized events through `supabase/functions/security-event-ingest/index.ts`,
- edge server events now write through `supabase/functions/_shared/securityEventLogger.ts`.

Current operational owner:
- primary owner: security hardening stream / current lesson owner,
- release-time reviewer: whoever completes `docs/production-security-release-checklist.md`,
- future steady-state owner: engineering owner for auth/admin/runtime operations.

Retention policy (target baseline):
- raw security events: retain 30 days,
- release/incident investigation notes derived from those events: retain 90 days after closure,
- no passwords, tokens, service-role keys, clear-text email addresses, or arbitrary user payloads in stored security events.

## 3) Minimum Event Contract
Required fields:
- `event`
- `source`
- `reason`
- `action`
- `timestamp`

Optional fields:
- `severity`
- `status`
- `actorId` (server-side only; never from browser-local telemetry)
- `details` (sanitized allowlist only)
- `code` (normalized safe error code)

Rules:
- Keep values short, normalized, and machine-friendly.
- Prefer operational categories over raw backend/provider messages.
- `details` must stay bounded and must not carry secrets or full request payloads.
- Browser emitters should never attach clear-text identifiers that are not already safe for client storage.

Recommended normalized values:
- `severity`: `info` | `warn` | `critical`
- `source`: `auth` | `register` | `chat` | `admin` | `release`
- `reason` examples:
  - `cooldown_activated`
  - `cooldown_blocked`
  - `rate_limit`
  - `rate_limit_received`
  - `burst_blocked`
  - `duplicate_email`
  - `weak_password`
  - `network`
  - `authz_denied`
  - `unexpected_error`

Normalization note:
- Existing register telemetry currently uses `eventType` instead of `event`.
- When routed into the centralized sink, `eventType` should be normalized to `event`.

## 4) Current Emitter Inventory

| Emitter | Files | Current event shape | Current sink | Notes / gap |
| --- | --- | --- | --- | --- |
| Auth cooldown/backoff | `src/utils/authThrottle.js`, `src/utils/antiAbuseTelemetry.js`, `src/utils/securityEventIngest.js` | `event/source/reason/action/timestamp/details` | Browser local telemetry + `security-event-ingest` -> `public.security_events` | Centralized forwarding now exists; browser actor identity stays intentionally optional. |
| Register failure telemetry | `src/utils/registerFailureTelemetry.js`, `src/pages/register/register.js`, `src/utils/securityEventIngest.js` | `eventType/reason/code/timestamp` normalized to shared contract on ingest | Browser local telemetry + `security-event-ingest` -> `public.security_events` | Contract normalization now happens at ingest path (`eventType` -> `event`). |
| Chat client cooldown | `src/components/ChatWidget.js`, `src/utils/antiAbuseTelemetry.js`, `src/utils/securityEventIngest.js` | `event/source/reason/action/timestamp/details` | Browser local telemetry + `security-event-ingest` -> `public.security_events` | Centralized forwarding is active for client-side rate-limit/cooldown signals. |
| Chat server rate limit | `supabase/functions/chat-with-ai/index.ts`, `supabase/functions/_shared/antiAbuseLogger.ts`, `supabase/functions/_shared/securityEventLogger.ts` | `event/source/reason/action/timestamp/actorId/details` | `public.security_events` (+ structured `console.warn`) | Server-side signal now lands in centralized storage with actor scope when available. |
| Admin mutation burst blocking | `supabase/functions/create-user/index.ts`, `supabase/functions/update-user/index.ts`, `supabase/functions/delete-user/index.ts`, `supabase/functions/_shared/antiAbuseLogger.ts`, `supabase/functions/_shared/securityEventLogger.ts` | `event/source/reason/action/timestamp/details` | `public.security_events` (+ structured `console.warn`) | Centralized signal for 429 admin burst blocks is now active. |
| Admin authz denied | `supabase/functions/_shared/adminAuth.ts`, `supabase/functions/_shared/securityEventLogger.ts` | `event/source/reason/action/timestamp/status/actorId/details` | `public.security_events` | New structured telemetry for denied admin access paths (`401/403`, role/aal checks). |

## 5) Current Gaps To Close
- Frontend telemetry now forwards centrally, but browser-origin events intentionally avoid strong identity fields.
- Some less-critical security paths still rely on local telemetry/log review and are not yet fully normalized.
- Alert automation currently covers the first high-signal rules only; additional flow-specific tuning is still expected.

## 6) Approved Sink Model For Future Implementation
Phase 1 target:
1. Browser-side security emitters send sanitized events to a dedicated Edge Function.
2. The Edge Function validates the contract, strips unexpected fields, and writes to `security_events`.
3. Server-side emitters use the same shared contract and either:
   - write directly through the same storage helper, or
   - call the same validation path before persistence.

Minimum stored fields:
- `event`
- `source`
- `reason`
- `action`
- `severity`
- `status`
- `timestamp`
- `actor_id` (nullable, server-side only)
- `details_json`

Non-goals:
- storing full request bodies,
- storing secrets,
- storing arbitrary HTML or user-generated rich text in security events.

## 7) Review And Ownership Workflow
Per release candidate:
- verify no unexpected spike in auth/chat/admin blocked events,
- verify the live verification runbook did not surface repeated security failures,
- attach investigation notes to the same release evidence flow as `docs/production-security-release-checklist.md`.
- apply the routing and thresholds from `docs/security-alerting-runbook.md`.

Per incident:
- use `docs/lesson-2-anti-abuse-runbook.md` for threshold tuning decisions,
- summarize source, reason, action, and user impact,
- record any threshold or routing changes in `docs/security-chat-snapshot.md`.

## 8) Next Step Handoff
What `L6-OBS-01` completes:
- one documented security event inventory,
- one approved target ingestion path,
- one baseline retention/ownership model.

What remains after `L6-OBS-03`:
- tune rule thresholds with real traffic evidence,
- expand centralized coverage to additional authz/release-sensitive signals as needed.
