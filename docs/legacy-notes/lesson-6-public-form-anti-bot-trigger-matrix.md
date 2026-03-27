# Lesson 6 Public Form Anti-Bot Trigger Matrix (`L6-ABUSE-01`)

Last updated: 2026-03-21

## 1) Purpose
Define exactly when public-form anti-bot controls (CAPTCHA or equivalent challenge) are required, and when they are not.

This keeps rollout evidence-driven instead of blanket-enabled.

## 2) In-Scope Public Flows
Current public-form scope:
- `register` flow (`/register.html`)
- `contact` form (`/contact.html`)

Current risk ranking:
1. `register` (account creation abuse, credential stuffing support noise)
2. `contact` (spam/flooding and moderation overhead)

## 3) Evidence Sources
Use these evidence sources before any anti-bot rollout:
- `security_events` / `security_alert_incidents` from `L6-OBS-03`
- alert thresholds in `docs/security-alerting-runbook.md` (especially `ALT-AUTH-01`)
- anti-abuse telemetry fields from `docs/lesson-2-anti-abuse-runbook.md`
- `public.contact_messages` volume + spam triage ratio
- support/moderation incident notes (same-day operator evidence)

## 4) Trigger Matrix
| Level | Pattern | Threshold | Decision |
| --- | --- | --- | --- |
| `Observe` | Isolated abuse bursts with no sustained pattern | Below warn thresholds, or single short spike resolved by existing cooldown/limits | Keep current controls only; no anti-bot rollout |
| `Prepare` | Repeated pressure, but not yet incident-grade | Any one of: `ALT-AUTH-01` warn on `register` in `>= 2` windows within `24h`; `contact` submissions `>= 40` in `15m`; spam triage ratio `>= 30%` in one day | Open/refresh `L6-ABUSE-01` evidence note and pre-select provider/options; no production enable yet |
| `Activate` | Sustained abuse that existing limits do not absorb | Any one of: `ALT-AUTH-01` critical on `register`; `contact` submissions `>= 80` in `15m`; daily `contact` spam triage ratio `>= 50%`; repeated user-visible degradation tied to abuse pattern | Start `L6-ABUSE-02` for highest-risk flow and ship scoped anti-bot control |

Decision rule:
- `Activate` requires either:
  - one `Activate` threshold hit plus confirmation that baseline throttling/cooldown tuning did not stabilize within `48h`, or
  - two distinct `Prepare` patterns sustained across `7` consecutive days.

## 5) Accessibility And UX Guardrails
Any anti-bot rollout is acceptable only if all are true:
- Keyboard and screen-reader flow remains usable on desktop and mobile.
- If anti-bot provider is unavailable, form falls back to safe fail behavior (clear retry path, no silent submit drop).
- Challenge is risk-scoped (not forced on every submit when abuse signal is absent).
- Error copy is explicit, non-hostile, and includes retry guidance.

## 6) `L6-ABUSE-02` Entry Criteria
Start implementation only when:
1. Trigger matrix reaches `Activate` for one flow.
2. Owner and rollback path are documented in `docs/lesson-6-task-tracker.md`.
3. Validation plan covers:
   - normal user submit success path,
   - challenge-failed path,
   - provider-unavailable path.

## 7) Rollback Criteria
Rollback anti-bot control and revert to throttling-only if any of:
- verified accessibility regression,
- meaningful legitimate-submit regression after rollout (`>= 20%` drop vs pre-rollout baseline for `48h`),
- provider outage causes user-facing dead-end path.

After rollback:
- keep existing throttling/cooldown controls,
- re-baseline thresholds and re-enter at `Prepare`.

## 8) Ownership And Review Cadence
- Primary owner: current security hardening stream owner.
- Review cadence: every release candidate and after any abuse incident.
- Evidence destination: `docs/security-chat-snapshot.md` + `docs/lesson-6-task-tracker.md`.
