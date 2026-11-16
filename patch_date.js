const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

code = code.replace(
  /const displayDate = eventData\?.date \? new Date\(eventData\.date\)\.toLocaleDateString\('de-DE', \{\s*day: '2-digit',\s*month: '2-digit',\s*year: 'numeric'\s*\}\) : 'TBA';/,
  `const displayDate = eventData?.date ? new Date(eventData.date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : '12.12.2026';`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
