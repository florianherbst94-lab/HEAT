const fs = require('fs');
const filePath = 'src/proxy.ts';
let content = fs.readFileSync(filePath, 'utf8');

// I am wondering if the issue is really Vercel Authentication or something in proxy.ts that causes Vercel to block it.
// If Vercel Authentication is off, why would it still say "not allowed by policy"?
// Maybe my proxy.ts rewrite is causing a routing loop, and Vercel returns "403 Forbidden" or "not allowed by policy" when a loop is detected?
// Let's completely disable the custom middleware logic temporarily to prove if it's our code or Vercel config.
const originalContent = `import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for api, _next, _vercel and static files
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)']
};
`;

fs.writeFileSync(filePath, originalContent);
