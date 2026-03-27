# Animation & Interaction Regression Checklist

Purpose:
- Keep animation and UI interaction behavior stable during CSP/runtime-style migration slices.

Scope pages:
- `src/index.html` (home)
- `src/how-it-works.html`
- `src/contact.html`

## 1) Quick manual pass (required)
Run on:
- Desktop and mobile viewport (`375x812`, `768x1024`, `1440x900`)
- Light and dark theme
- Reduced motion (`prefers-reduced-motion: reduce`)

Checks:
1. Home CTA (`Ready to transform your study habits?`) keeps intended visual style (clean gradient, no unexpected overlays).
2. Home scroll-to-top button appears after scroll and works on click.
3. How-It-Works hero `Study Hub` text effect matches approved visual style.
4. How-It-Works gallery lightbox opens, scales in, and closes on overlay click/Escape.
5. Contact constellation starts without runtime errors and form success flow animates correctly.
6. No page-level layout jumps or broken stacking (`z-index`) around animated sections.

## 2) Automated pass (recommended per slice)
Run:
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js`

What the e2e spec covers:
- Visual snapshots:
  - home CTA card
  - how-it-works hero text block
  - contact form card (with moving background disabled for stable diffing)
- Interaction checks:
  - how-it-works lightbox open/close
  - home scroll-to-top visibility toggle

## 3) Snapshot update rule
Only refresh baselines when:
1. A visual change is explicitly approved.
2. The change is documented in the active lesson tracker/snapshot.

Use:
- `npx playwright test tests/smoke/animation-regression.spec.js --update-snapshots`

