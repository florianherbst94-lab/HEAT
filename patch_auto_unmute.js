const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// The user wants the video to unmute automatically on any interaction (click, scroll)
// Let's add an event listener for this.

const autoUnmuteCode = `
  useEffect(() => {
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
  }, [isMuted]);
`;

code = code.replace(
  /  const videoUrl = eventData\?\.videoUrl \|\| '\/videos\/heat-promo\.mp4';/,
  `  const videoUrl = eventData?.videoUrl || '/videos/heat-promo.mp4';
${autoUnmuteCode}`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
