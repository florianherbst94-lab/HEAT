const fs = require('fs');

const filePath = 'src/proxy.ts';
let content = fs.readFileSync(filePath, 'utf8');

// If Vercel is blocking access.heatdresden.de and heatdresden.de, but heat-app-wheat.vercel.app works?
// Let's completely isolate the rewrite logic and see if we can use a Vercel-native rewrite approach instead of proxy.ts mutating nextUrl which might trigger a Vercel routing loop protection.
// Wait, "Request to GET / on access.heatdresden.de not allowed by policy" is a very specific Vercel Firewall / WAF message.
// The image shows Security settings. Deployment Protection is not in that list (it's under Deployment Protection on the left).
