const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// The code currently has:
// <video src={videoUrl} autoPlay loop playsInline
// className="object-cover w-full h-full opacity-60"
// />

// But browsers require 'muted' for autoplay, so we need to add a state and a button to unmute
// Let's add a state for isMuted
code = code.replace(
  /const \[consent, setConsent\] = useState\(false\);/,
  "const [consent, setConsent] = useState(false);\n  const [isMuted, setIsMuted] = useState(false);" // Wir setzen auf false, damit der Ton an ist, aber das blockiert autoplay in vielen browsern.
);

// We need an explicit muted state that the user can toggle if we want sound.
// Actually, the user asked to play the video with sound. 
// Autoplay with sound is blocked by most mobile browsers (iOS Safari, Android Chrome) unless the user interacts with the page first.
// If we just remove 'muted', the video will NOT autoplay on mobile at all. It will just be a black/frozen screen until the user taps.
// Let's add a state and play it with sound but keep it simple.
