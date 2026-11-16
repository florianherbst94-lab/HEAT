const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// Let's also make sure the video has standard attributes that help it play on iOS
code = code.replace(
  /<video ref=\{videoRef\} src=\{videoUrl\} autoPlay loop muted=\{isMuted\} playsInline/,
  '<video ref={videoRef} src={videoUrl} autoPlay loop muted playsInline webkit-playsinline="true"'
);

// We should also remove the dynamic muted={isMuted} because React sometimes has bugs with updating the muted attribute
// Instead, we always render muted={true} and only change it via the DOM node ref.
// Wait, we replaced `muted={isMuted}` with `muted`. So it will render muted initially.
// Let's also remove `muted={isMuted}`.
fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
