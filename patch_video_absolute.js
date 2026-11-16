const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// Let's force an absolute URL for the video and verify it works
code = code.replace(
  /const videoUrl = eventData\?\.videoUrl \|\| '\/videos\/heat-promo\.mp4';/,
  "const videoUrl = eventData?.videoUrl || 'https://heatdresden.de/videos/heat-promo.mp4';"
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
