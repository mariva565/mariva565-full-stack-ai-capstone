# Lesson 6 CSP Report-Only Triage (2026-03-20)

## 1) Purpose
Capture the current `L6-CSP-01` evidence and define a safe, staged path for `L6-CSP-02` enforcement.

Scope:
- `netlify.toml`
- `vercel.json`
- `src/**/*.html`
- selected runtime JS files that inject or mutate styles/scripts

## 2) Evidence Summary

### 2.1 Current deploy policy baseline
- `Content-Security-Policy-Report-Only` is active in:
  - `netlify.toml`
  - `vercel.json`
- Netlify/Vercel header parity is now test-guarded in:
  - `src/utils/deploySecurityHeaders.test.js`

### 2.2 Static readiness checks (this chat)
- Inline `<script>` blocks in `src/**/*.html`: `0`
- Inline HTML event handler attributes (`on*=`) in `src/**/*.html`: `0`
- Inline `style="..."` attributes in `src/**/*.html`: `112`
- Runtime style mutations are present (expected) in:
  - `src/pages/how-it-works/howItWorksPage.js`
  - `src/pages/index/indexPageEffects.js`
  - `src/pages/contact/contact.js`
  - residual templates outside the Stage B hotspot migration set
- Dynamic external script loading exists in:
  - `src/pages/admin/admin.js` (`loadScript` for Leaflet from `unpkg.com`)

### 2.3 External origin coverage check
Current app usage is aligned with the report-only allowlist for:
- `cdn.jsdelivr.net`
- `cdnjs.cloudflare.com`
- `unpkg.com`
- `www.gstatic.com`
- `fonts.googleapis.com`
- `fonts.gstatic.com`
- `lottie.host`
- `ui-avatars.com`
- `*.basemaps.cartocdn.com`
- `*.supabase.co`

## 3) Triage Outcome

### 3.1 What is ready now
- Strict `script-src` is ready:
  - no inline script blocks in HTML
  - no inline event handlers in HTML
- Existing third-party script hosts are explicitly allowlisted.

### 3.2 What is not ready yet
- Strict `style-src` without `'unsafe-inline'` is **not** ready:
  - significant inline style attributes remain in HTML templates
  - multiple pages rely on runtime `.style` or `cssText` assignments

## 4) `L6-CSP-02` staged enforcement plan

1. Stage A (safe enforcement first)
   - Enforce `Content-Security-Policy` with strict `script-src` (no `'unsafe-inline'` for scripts).
   - Keep `style-src 'unsafe-inline'` temporarily to avoid regressions.
   - Keep current `Report-Only` monitoring for additional drift signals.
   - Status (2026-03-20): implemented in `netlify.toml` and `vercel.json`; deploy parity checks pass.

2. Stage B (strict style hardening)
   - Remove high-volume inline `style="..."` usages from:
     - `src/components/layout.js`
     - `src/pages/admin/admin.js`
     - `src/pages/materials/materialsHandlers.js`
  - Replace with CSS classes/custom properties where possible.
  - Re-test and then remove `'unsafe-inline'` from `style-src`.
  - Status (2026-03-20): hotspot migration completed for the three target files via `src/styles/components/csp-stage-b.css`; residual inline style/template blockers still remain before final `style-src` tightening.

## 5) Risks / Blockers
- No dedicated CSP `report-uri`/`report-to` endpoint is configured yet, so violation evidence is currently manual (browser/devtools).
- Immediate strict `style-src` enforcement would break key UI flows.
- Hosted `L6-2FA-02` rollout remains paused (`shared Supabase`), and this CSP work should stay independent (no hosted `supabase db push` in this slice).

## 6) Completion Criteria For Moving `L6-CSP-02` To Done
- Stage A enforcement deployed without login/register/admin critical-path regressions.
- Stage B style migration completed for major inline-style hotspots.
- `'unsafe-inline'` removed from `style-src` and smoke checks pass.
