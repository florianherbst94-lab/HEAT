const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// wir entfernen 'muted' von der video komponente
code = code.replace(
  /<video\s*src=\{videoUrl\}\s*autoPlay\s*loop\s*muted\s*playsInline/g,
  '<video src={videoUrl} autoPlay loop playsInline'
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
