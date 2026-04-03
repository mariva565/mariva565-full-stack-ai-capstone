const fs = require('fs');

const txt = `
### Session 32 (Custom Error Pages & Loader)

**What we implemented:**
- Created custom Next.js 404 Not Found page \`not-found.tsx\` and \`components/not-found/not-found-client.tsx\`
- Created custom 403 Access Denied page \`forbidden/page.tsx\` and \`components/forbidden/forbidden-client.tsx\`
- Both error pages feature premium glassmorphism, animated mascots, full dark mode support, and respect for user motion preferences.
- Refactored \`components/ui/spinner.tsx\` to remove the heavy card background, replacing it with a minimalist, purely CSS glowing ring and floating text, significantly reducing visual hierarchy weight.
`;

fs.appendFileSync('docs/dev-log.md', txt);
