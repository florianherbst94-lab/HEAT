const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// We want to remove the explicit mute button and instead unmute automatically on any interaction (click, touch)
// Let's modify the file to handle this.

code = code.replace(
  /const \[isMuted, setIsMuted\] = useState\(true\);/,
  "const [isMuted, setIsMuted] = useState(true);\n  const [hasInteracted, setHasInteracted] = useState(false);"
);

// We add an event listener to the main container that unmutes the video on first interaction
code = code.replace(
  /<div className="relative w-full min-h-\[100svh\] overflow-hidden -mt-24">/,
  `<div 
      className="relative w-full min-h-[100svh] overflow-hidden -mt-24 cursor-pointer"
      onClick={() => {
        if (!hasInteracted && videoRef.current) {
          videoRef.current.muted = false;
          setIsMuted(false);
          setHasInteracted(true);
        }
      }}
    >`
);

// Remove the mute button we added previously
code = code.replace(
  /\{\/\* Sound Toggle \*\/\}.*?\{\/\* Form \*\/\}/s,
  `{/* Form */}`
);

// We should also let the user know they can tap to unmute
// Let's add a small, elegant "Tap anywhere to unmute" message that disappears after interaction
code = code.replace(
  /\{\/\* Background Video \*\/\}/,
  `{/* Background Video */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-heat-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-heat-chrome-dark flex items-center gap-2 pointer-events-none"
          >
            <svg className="w-4 h-4 text-heat-chrome" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="text-xs text-heat-chrome font-medium tracking-wider uppercase">Tap to unmute</span>
          </motion.div>
        )}
      </AnimatePresence>`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
