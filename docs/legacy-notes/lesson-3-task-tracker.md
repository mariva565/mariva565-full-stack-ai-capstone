# Lesson 3 Task Tracker

Status legend:
- `todo`
- `in_progress`
- `done`
- `blocked`

## P0 (Critical First)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L3-CSP-01` | login/register | `done` | Removed inline script blocks from `src/login.html` and `src/register.html`; moved behavior into `src/pages/login/loginPageInit.js` and `src/pages/register/registerPageInit.js` (theme toggle, AOS init, mascot interactions). |

## P1 (High)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L3-CSP-02` | public pages | `done` | Removed inline handler attributes and inline script blocks from `src/index.html` + `src/maintenance.html`; moved logic to `src/pages/index/indexPageEffects.js`, `src/pages/index/indexHero3d.js`, `src/pages/index/indexPageModules.js`, and `src/pages/maintenance/maintenancePageInit.js`. |
| `L3-CSP-03` | public pages | `done` | `how-it-works` + `modules` + `courses` + `contact` + `materials` slices are complete. `materials` cleanup removed inline script blocks from `src/materials.html` and moved initialization (PDF.js worker config + `ChatWidget`) into `src/pages/materials/materialsPageInit.js`. |

## Post-closeout stabilization (2026-03-19)
- Home page reliability hotfix: added resilient AOS initialization + fallback reveal in `src/pages/index/indexPageEffects.js` to avoid hidden sections when AOS loads late/fails.
- Encoding cleanup hotfix: removed mojibake from `src/login.html`, `src/register.html`, and `src/pages/materials/materialsRenderer.js`.

## Next chat pick
Pick max 2 tasks per chat. Recommended order:
1. Start Lesson 4 (`Security Regression Tests`) with one focused test slice.
2. Run `npm.cmd run test`, `npm.cmd run build`, and `npm.cmd run test:e2e`.
3. Refresh `security-chat-snapshot` + `security-learning-master-plan`.

## Validation status (latest known)
- `npm.cmd run test` -> PASS (2026-03-19)
- `npm.cmd run build` -> PASS (2026-03-19)
- `npm.cmd run test:e2e` -> PASS (2026-03-19)
