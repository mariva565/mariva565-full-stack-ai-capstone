# Next Chat Prompt Templates

## Template A: Continue Lesson 1 (Implementation)
```text
Continue Lesson 1. Use these files as context:
- docs/security-chat-index.md
- docs/security-chat-snapshot.md
- docs/lesson-1-guided-security-review.md
- docs/lesson-1-task-tracker.md

In this chat, implement:
- <TASK_ID_1>
- <TASK_ID_2> (optional)

I want:
1) real code changes
2) short validation (build/tests if relevant)
3) tracker + snapshot updates
```

## Template B: Lesson 1 (Review Only)
```text
I want review-only for Lesson 1 task:
- <TASK_ID>

Use:
- docs/security-chat-index.md
- docs/lesson-1-guided-security-review.md
- docs/lesson-1-task-tracker.md

Return:
1) risks by severity
2) exact files/lines
3) concrete next steps
```

## Template C: Session Handoff Update
```text
Before we finish this chat, update:
- docs/lesson-1-task-tracker.md
- docs/security-chat-snapshot.md

Leave a short handoff:
- done
- next
- blocked/risky
```

## Template D: Start New Security Topic (Lesson 2 / CSP / Regression Tests)
```text
Start a new security topic, but keep continuity from:
- docs/security-chat-index.md
- docs/security-chat-snapshot.md

New topic:
- <Lesson 2 | CSP | Security regression tests>

I want:
1) small-step plan (max 2 tasks per chat)
2) implement first task
3) snapshot update
```

## Template E: Continue Current Active Lesson (Lesson 6)
```text
Continue the current security workstream. Use:
- docs/security-chat-index.md
- docs/security-chat-snapshot.md
- docs/lesson-6-guided-security-review.md
- docs/lesson-6-task-tracker.md
- docs/admin-2fa-rollout-strategy.md
- docs/admin-2fa-validation-checklist.md

In this chat, implement or review:
- <L6-2FA-02 | L6-ABUSE-01>

I want:
1) small-step scope (max 2 tasks)
2) tracker + snapshot updates
3) blockers/rollout risks called out clearly
```

## Template F: Execute Priority Hardening Plan (Lesson 6 follow-up)
```text
Continue Lesson 6 using the external-review follow-up plan. Use:
- docs/security-chat-index.md
- docs/security-chat-snapshot.md
- docs/lesson-6-guided-security-review.md
- docs/lesson-6-task-tracker.md
- docs/lesson-6-priority-hardening-plan.md

In this chat, execute max 2 tasks:
- <L6-2FA-02 | L6-OBS-03 | L6-CSP-01 | L6-REG-02 | L6-RLS-01 | L6-DEP-03>

I want:
1) small-step implementation (no big-bang)
2) short validation summary
3) tracker + snapshot + master-plan sync
4) explicit done/next/blocked handoff
```

## Template G: Reusable Continuity Kickoff (Any Project)
```text
Start security work using the continuity procedure. Use:
- docs/security-continuity-procedure.md
- docs/security-chat-index.md
- docs/security-chat-snapshot.md
- docs/security-learning-master-plan.md
- docs/<active-lesson>-task-tracker.md

Mode:
- <implement | review | tests/docs>

In this chat do max 2 tasks:
- <TASK_ID_1>
- <TASK_ID_2>

Constraints:
- <no deploy / no hosted db push / branch rules>

Return:
1) files changed
2) validation commands + PASS/FAIL
3) done/next/blocked
4) rollback note
5) rollout safety note
```

## Template H: End-of-Chat Mandatory Sync (Any Project)
```text
Before closing this chat, run the continuity handoff contract from:
- docs/security-continuity-procedure.md (Section 5)

Update:
- docs/<active-lesson>-task-tracker.md
- docs/security-chat-snapshot.md
- docs/security-learning-master-plan.md (only if lesson/subpoint changed)

Handoff must include:
1) Done
2) Validation
3) Next (max 3)
4) Blocked/Risky
5) Rollback note
6) Rollout safety note
```









Продължи L6-2FA-02 от текущия marker (без дълго пре-проучване). Използвай:
- docs/lesson-6-task-tracker.md (Quick Resume)
- docs/admin-2fa-validation-checklist.md
- docs/security-chat-snapshot.md

Важно:
- Hosted rollout е paused (shared Supabase за Netlify+Vercel).
- Текущото поведение е expected: session-based MFA (aal2), не per-action re-prompt.
- Confirm modal при delete/block/role е UX, а enforcement е server-side (admin + aal2).

Задача:
1) Подготви кратък execution план за hosted validation (когато има maintenance window/isolated env).
2) Минѝ checklist-а за L6-2FA-02 и отбележи PASS/FAIL + оставащи рискове.
3) Синхронизирай docs/lesson-6-task-tracker.md, docs/security-chat-snapshot.md, docs/security-learning-master-plan.md (done/next/risk).
