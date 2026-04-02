# StudyHub v2 Performance Guardrails

Use this as a quick checklist before building or refactoring the next authenticated web page.

## Core Rule

Prefer **server-first initial data** whenever the first render depends on authenticated, user-specific content.

Avoid this pattern:
- empty client state
- full-page spinner
- `useEffect` fetch after mount
- real content appears later

That pattern creates the "blank first, real data later" feel we already removed from:
- `Dashboard`
- `Progress`
- `Calendar`

## Preferred Page Shape

For app pages that need initial data plus client interactions:

1. `app/.../page.tsx` should be an async server page.
2. Read auth on the server.
3. Fetch and normalize initial data on the server.
4. Pass `initialData` into a dedicated client component.
5. Keep only mutations and interactive state on the client.

Good fit for this pattern:
- dashboards
- profile/account pages
- calendars
- detail pages with user-specific data
- pages that otherwise show a spinner before basic content

## Shared Chrome Rule

Do not add separate duplicate auth fetches in shared UI like the navbar if the same user info can come from the server render path.

Bad example:
- navbar mounts
- navbar fetches `/api/auth/me`
- role/avatar/name appear later

Preferred direction:
- navbar receives already-known user data
- or reads from a shared server-auth-aware path

## Loading Rule

Loading fallbacks should be quiet and lightweight.

Avoid:
- decorative loading screens that do a lot of work
- heavy animation loops in fallback UI
- full-page loading for small background refreshes

Prefer:
- small inline "updating..." states for local refreshes
- simple fallback copy
- minimal animation

## Animation Rule

Expensive visual effects should be gated by:
- viewport visibility
- actual user interaction
- reduced-motion preference
- pointer/device capability when relevant

Avoid always-running loops when the effect is off-screen or idle.

## Reuse Rule

When moving a page to server-first loading:
- extract shared types
- extract shared server data helpers
- keep date/value normalization in one place
- avoid forking the same query logic between page code and API routes

## Current Follow-up

Next performance cleanup targets:
- `Navbar auth fetch cleanup`
- `Profile server-first`

Review these before building more authenticated screens:
- Can this page render meaningful first content from the server?
- Can it avoid a first-load spinner?
- Is any auth/data fetch duplicated in shared layout UI?
