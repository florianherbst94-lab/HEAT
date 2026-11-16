const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// The safest way to handle sound is to start muted (so it autoplays), and show an "Unmute" button.
// Or, start unmuted and let the browser block it, then show a "Play Video" button.
// Let's implement an Unmute button overlay if sound is desired.

code = code.replace(
  /const \[consent, setConsent\] = useState\(false\);/,
  "const [consent, setConsent] = useState(false);\n  const [isMuted, setIsMuted] = useState(false);\n  const videoRef = typeof window !== 'undefined' ? require('react').useRef<HTMLVideoElement>(null) : null;"
);

// This is getting complicated with the hooks. Let's just do a simpler replace.
