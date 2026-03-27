# Security Alerting Runbook (`L6-OBS-02`)

Last updated: 2026-03-20

## 1) Purpose
This runbook defines the first alert thresholds, owner routing, and first-response actions for StudyHub's highest-signal security events.

Goals:
- turn security telemetry into concrete operational action,
- define who responds first when a risky pattern appears,
- keep release and incident decisions consistent.

## 2) Scope And Assumptions
This runbook builds on:
- `docs/security-observability-baseline.md`
- `docs/lesson-2-anti-abuse-runbook.md`
- `docs/production-security-release-checklist.md`

Operational assumption:
- centralized `security_events` + `security_alert_incidents` ingestion/rule path is now implemented (`L6-OBS-03`) for the first high-signal auth/chat/admin/authz events,
- release-candidate review still remains mandatory because not every security-relevant signal is fully automated yet.

Windowing rule:
- use rolling 15-minute windows unless the alert definition says otherwise.

Severity meanings:
- `warn`: investigate the same day and before the next release signoff,
- `critical`: immediate investigation; release stays blocked until triaged.

## 3) Owner Routing
Primary owners by area:
- `auth/register` signals -> auth flow owner or current security lesson owner
- `chat` signals -> AI/chat flow owner or current security lesson owner
- `admin/authz` signals -> admin flow owner plus current security lesson owner
- `release` signals -> release reviewer completing `docs/production-security-release-checklist.md`

Escalation path:
1. Primary owner investigates and classifies false positive vs real issue.
2. If user impact, repeated abuse, or possible authorization drift exists, escalate to engineering/release owner immediately.
3. If the issue affects a preview/live release candidate, keep the release blocked until the owner documents the decision and rollback/fix path.

## 4) Alert Matrix

| Alert ID | Signal | Warn threshold | Critical threshold | Primary owner | Release impact |
| --- | --- | --- | --- | --- | --- |
| `ALT-AUTH-01` | Auth cooldown / blocked attempts (`source=auth`, `reason=cooldown_activated|cooldown_blocked`) | `>= 10` blocked/activated events in `15m` for one auth flow | `>= 25` events in `15m` or confirmed legitimate-user lockout trend | auth/security owner | Block release if the issue is reproducible for legitimate users or caused by a client bug/retry loop |
| `ALT-CHAT-01` | Chat rate-limit pressure (`source=chat`, `reason=rate_limit|rate_limit_received|cooldown_blocked`) | `>= 12` rate-limit events in `15m` | `>= 30` events in `15m` or visible user-facing degradation on preview/live | chat/security owner | Block release if the preview/live environment shows sustained user-facing failures |
| `ALT-ADMIN-01` | Admin mutation burst blocking (`source=admin`, `reason=burst_blocked`) | `>= 3` blocked admin mutations in `15m` | `>= 6` blocked admin mutations in `15m`, or repeated blocking from more than one actor/session | admin/security owner | Block release until abuse vs misconfiguration is understood |
| `ALT-AUTHZ-01` | Suspicious authorization denials (`reason=authz_denied`, repeated `401/403/42501` on privileged flows) | `>= 3` denied privileged actions in `15m` for one actor/flow | any repeated denied privileged action across multiple actors, or any denial trend after a role/policy/deploy change | admin/security owner | Immediate blocker for admin/authz changes and release candidates |
| `ALT-REL-01` | Release security gate failure (live smoke, headers/env contract, or blocker-level dependency advisory) | n/a | any failed required release gate | release reviewer | Always block release |

## 5) First-Response Actions

### `ALT-AUTH-01` Auth abuse / lockout
1. Confirm whether the signal comes from real repeated failures or a frontend retry loop.
2. Check whether the issue is isolated to `login`, `register`, or `password_reset`.
3. If legitimate users are being blocked, treat it as `critical`.
4. Use `docs/lesson-2-anti-abuse-runbook.md` before tuning thresholds.
5. Record the outcome in `docs/security-chat-snapshot.md`.

### `ALT-CHAT-01` Chat rate-limit pressure
1. Verify whether the pressure comes from one actor, one environment, or a general spike.
2. Confirm that the UI still shows predictable cooldown/retry messaging.
3. If preview/live users cannot use chat reliably, treat it as `critical`.
4. If tuning is required, change one limiter parameter at a time and follow the anti-abuse validation steps.
5. Record whether the final action was observe, tune, or rollback.

### `ALT-ADMIN-01` Admin burst blocking
1. Confirm whether the blocked mutations are expected bulk admin activity or suspicious automation.
2. Check whether the actor recently changed roles, tabs, or retry behavior.
3. If multiple actors/sessions are affected, escalate immediately.
4. Freeze risky admin changes during release/demo verification until the cause is clear.
5. Keep the incident note minimal and non-sensitive.

### `ALT-AUTHZ-01` Suspicious authorization denials
1. Confirm the exact protected flow and whether the actor should have access.
2. Review recent role, RLS, policy, or deploy changes.
3. If the denial follows a fresh deploy or policy change, keep the release blocked.
4. If denials appear malicious, preserve evidence and avoid widening permissions as a quick fix.
5. Document whether the root cause was expected access control, role drift, or regression.

### `ALT-REL-01` Release gate failure
1. Freeze the release candidate immediately.
2. Identify whether the blocker is dependency-, auth-, env-, or deploy-config-related.
3. Decide fix-forward vs rollback using the existing release runbook/checklist.
4. Do not sign off while a required security gate remains red.

## 6) Known Instrumentation Gaps
Current instrumentation limits (after `L6-OBS-03`):
- first automated coverage is active, but not all possible security signals are routed through one taxonomy yet,
- browser-origin telemetry is centrally ingested now, but actor identity can remain unavailable by design for unauthenticated flows,
- threshold tuning still needs real-traffic review to reduce false positives.

Interim rule:
- treat these thresholds as the required response policy even when the evidence comes from manual log review or release smoke output.

## 7) Review Cadence
- Review alert thresholds on every release candidate.
- Review after any real abuse incident or authz regression.
- Update this file if thresholds, owners, or escalation paths change.

## 8) Next Step Handoff
What `L6-OBS-02` completes:
- first approved alert thresholds for auth/chat/admin/authz/release signals,
- explicit owner routing,
- first-response actions tied to release-blocker behavior.

What remains after this:
- threshold tuning and signal expansion on top of the now-active centralized sink,
- use the completed `L6-DEP-02` scripts/checklist workflow on the next maintenance or release cycle.
