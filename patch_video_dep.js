const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// There is a bug in the code: useEffect depends on videoUrl which is defined AFTER the useEffect!
// We need to move the videoUrl definition up or fix the dependency array.

code = code.replace(
  /  useEffect\(\(\) => \{\n    \/\/ Force video to play on mount\n    if \(videoRef\.current\) \{\n      videoRef\.current\.play\(\)\.catch\(e => console\.error\('AutoPlay failed:', e\)\);\n    \}\n  \}, \[videoUrl\]\);\n  \n  const \[eventData, setEventData\]/g,
  `  const [eventData, setEventData] = useState<{ id: string, date: string, videoUrl: string } | null>(null);
  const videoUrl = eventData?.videoUrl || '/videos/heat-promo.mp4';
  
  useEffect(() => {
    // Force video to play on mount
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error('AutoPlay failed:', e));
    }
  }, [videoUrl]);
  `
);

// We also need to remove the old definition of videoUrl
code = code.replace(
  /  const videoUrl = eventData\?\.videoUrl \|\| '\/videos\/heat-promo\.mp4';\n/g,
  ''
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
