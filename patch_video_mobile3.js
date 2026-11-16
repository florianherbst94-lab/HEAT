const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// The issue might be that React is not correctly handling the autoPlay attribute on mount,
// or the video needs a key to force re-render, or we need to programmatically call play() in a useEffect.
// Let's ensure the video plays on mount.

code = code.replace(
  /const videoRef = useRef<HTMLVideoElement>\(null\);/,
  `const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Force video to play on mount
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error('AutoPlay failed:', e));
    }
  }, [videoUrl]);`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
