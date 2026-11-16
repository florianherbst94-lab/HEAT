const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// Add an explicit play() call on interaction, just in case mobile blocked autoplay entirely
code = code.replace(
  /videoRef\.current\.muted = false;/,
  "videoRef.current.muted = false;\n          videoRef.current.play().catch(e => console.error('Play failed:', e));"
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
