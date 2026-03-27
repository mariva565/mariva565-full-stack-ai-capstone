# Security Continuity Procedure (Reusable Across Projects)

Last updated: 2026-03-21

## 1) Purpose
Use one small, repeatable process so security work does not drift between chats or between projects.

Goals:
- continuity across chats,
- low documentation overhead,
- deterministic handoff quality.

## 2) Required Core Files (for any project)
Create these 5 files at project start:
1. `docs/security-chat-index.md`
2. `docs/security-chat-snapshot.md`
3. `docs/security-learning-master-plan.md`
4. `docs/<active-lesson>-task-tracker.md`
5. `docs/definition-of-done.md`

Optional but recommended:
- `docs/next-chat-prompt-templates.md`
- topic-specific checklists/runbooks (rollout, alerting, RLS, etc.)

## 3) Operating Modes Per Chat
Choose one mode at chat start:
1. `implement`: code + tests + docs delta
2. `review`: findings only (no code changes unless requested)
3. `tests/docs`: validation + documentation sync only

Scope rule:
- one chat = max 2 tasks
- each task must have a stable ID (example: `L6-SES-01`)

## 4) Minimal Update Matrix (to reduce overhead)
Update only what changed:

1. Always update:
- active task tracker
- security snapshot

2. Update only on state change:
- master plan (lesson/subpoint changed)
- priority plan (priority/order/risk changed)

3. Do not update unrelated long docs in every chat.

## 5) End-of-Chat Handoff Contract (mandatory)
Every security chat ends with the same 6 blocks:
1. `Done`: concrete files/behaviors changed
2. `Validation`: exact commands + PASS/FAIL
3. `Next`: max 3 actionable next steps
4. `Blocked/Risky`: explicit risks and dependencies
5. `Rollback note`: what to revert first if needed
6. `Rollout safety note`: what was intentionally NOT executed

## 6) Evidence Rules
For each completed task ID:
1. reference files changed
2. include at least one validation artifact:
   - test command,
   - build command,
   - or explicit docs-only note
3. include deny/negative-path evidence for security-sensitive changes

## 7) Branch and Rollout Safety
1. Work on non-deploy branch.
2. Commit only after green required gates.
3. Never execute deploy/hosted rollout actions unless explicitly approved in chat.
4. Always write the rollout safety note in handoff.

## 8) Continuity Prompt Contract (for next chat)
Start next chat with:
1. current task IDs
2. current marker commit
3. files to treat as source-of-truth:
   - snapshot
   - active tracker
   - master plan
4. constraints (for example: "no hosted db push")

## 9) Weekly Archive Rule (prevents giant files)
When `security-chat-snapshot.md` becomes too long:
1. move old handoff notes into `docs/archive/security-chat-snapshot-YYYY-MM.md`
2. keep only:
   - current state
   - last 3 handoffs
   - current blockers

This keeps context short without losing history.

## 10) Ready-to-Copy Quick Checklist
- [ ] Pick mode (`implement/review/tests-docs`)
- [ ] Pick max 2 task IDs
- [ ] Implement/review scope
- [ ] Run required validation
- [ ] Update tracker + snapshot
- [ ] Update master plan only if state changed
- [ ] Write 6-block handoff contract
- [ ] Confirm rollout safety constraints respected
