const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

code = code.replace(
  /  const \[eventData, setEventData\] = useState<\{ id: string, date: string, videoUrl: string \} \| null>\(null\);\n  \n  useEffect\(\(\) => \{\n    \/\/ Force video to play on mount\n    if \(videoRef\.current\) \{\n      videoRef\.current\.play\(\)\.catch\(e => console\.error\('AutoPlay failed:', e\)\);\n    \}\n  \}, \[videoUrl\]\);\n   = useState<\{ id: string, date: string, videoUrl: string \} \| null>\(null\);/g,
  `  const [eventData, setEventData] = useState<{ id: string, date: string, videoUrl: string } | null>(null);
  const videoUrl = eventData?.videoUrl || '/videos/heat-promo.mp4';
  
  useEffect(() => {
    // Force video to play on mount
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error('AutoPlay failed:', e));
    }
  }, [videoUrl]);`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
