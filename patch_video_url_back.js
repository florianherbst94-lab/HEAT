const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

code = code.replace(
  /const videoUrl = eventData\?\.videoUrl \|\| 'https:\/\/heatdresden\.de\/videos\/heat-promo\.mp4';/,
  "const videoUrl = eventData?.videoUrl || '/videos/heat-promo.mp4';"
);

// We can also simplify the video tag again since React's default playsInline is fine.
code = code.replace(
  /<video ref=\{videoRef\} src=\{videoUrl\} autoPlay loop muted playsInline webkit-playsinline="true"/,
  '<video ref={videoRef} src={videoUrl} autoPlay loop muted playsInline'
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
