const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// Add hasManuallyToggled state
code = code.replace(
  /const \[isMuted, setIsMuted\] = useState\(true\);\n/,
  "const [isMuted, setIsMuted] = useState(true);\n  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);\n"
);

// Update auto-unmute logic
const oldEffect = `  useEffect(() => {
    // Unmute on first interaction
    const handleInteraction = () => {
      if (isMuted && videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
        // Force play just in case
        videoRef.current.play().catch(e => console.error('Play failed:', e));
      }
    };

    // Listen to various interactions
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isMuted]);`;

const newEffect = `  useEffect(() => {
    // Unmute on first interaction ONLY if user hasn't manually toggled
    const handleInteraction = () => {
      if (isMuted && !hasManuallyToggled && videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
        // Force play just in case
        videoRef.current.play().catch(e => console.error('Play failed:', e));
      }
    };

    // Only listen if we haven't manually toggled and are still muted
    if (isMuted && !hasManuallyToggled) {
      window.addEventListener('click', handleInteraction);
      window.addEventListener('scroll', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
    }

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isMuted, hasManuallyToggled]);`;

code = code.replace(oldEffect, newEffect);

// Update button onClick
code = code.replace(
  /          onClick=\{\(e\) => \{\n            e\.stopPropagation\(\);\n            if \(videoRef\.current\) \{\n              videoRef\.current\.muted = !isMuted;\n              setIsMuted\(!isMuted\);/,
  `          onClick={(e) => {
            e.stopPropagation();
            setHasManuallyToggled(true);
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
