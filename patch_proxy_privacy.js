const fs = require('fs');
let code = fs.readFileSync('src/proxy.ts', 'utf8');

// The issue with /privacy on the access subdomain is that the proxy routes EVERYTHING on access.* to /access.
// We need to allow routing to /privacy and other shared pages from the access subdomain.
// Or we need to make sure the privacy link goes to the main domain.
// Yes, the privacy link on the access page should go to the main domain, not the access subdomain.

code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');
code = code.replace(
  /<a href="\/privacy" target="_blank" className="underline hover:text-white">Datenschutzerklärung<\/a>/,
  '<a href="https://heatdresden.de/de/privacy" target="_blank" className="underline hover:text-white">Datenschutzerklärung</a>'
);
fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
