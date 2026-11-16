const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// 1. Add Volume imports
code = code.replace(
  /import \{ motion, AnimatePresence \} from 'framer-motion';/,
  "import { motion, AnimatePresence } from 'framer-motion';\nimport { Volume2, VolumeX } from 'lucide-react';"
);

// 2. Remove the cursor-pointer and onClick from the main div
code = code.replace(
  /className="relative w-full min-h-\[100svh\] overflow-hidden -mt-24 cursor-pointer"\s+onClick=\{[\s\S]*?\}\s+>/,
  'className="relative w-full min-h-[100svh] overflow-hidden -mt-24">'
);

// 3. Remove the Tap to unmute message
code = code.replace(
  /\{\/\* Background Video \*\/\}\s+<AnimatePresence>[\s\S]*?<\/AnimatePresence>/,
  '{/* Background Video */}'
);

// 4. Add the button at the bottom of the main container (before the final closing div)
// Actually we can put it right next to the Background Video or at the end of the return statement.
const buttonCode = `
      {/* Mute Toggle Button */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
              
              if (isMuted) {
                // If we are unmuting, make sure it's playing
                videoRef.current.play().catch(e => console.error('Play failed:', e));
              }
            }
          }}
          className="fixed bottom-6 right-6 z-50 p-3 bg-heat-anthracite/80 backdrop-blur-sm border border-heat-chrome-dark rounded-full text-heat-chrome hover:text-white hover:border-heat-chrome transition-all duration-300 shadow-lg group"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {!isMuted ? (
            <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          
          {/* Pulsing effect when unmuted */}
          {!isMuted && (
            <span className="absolute inset-0 rounded-full border border-heat-red/50 animate-ping" />
          )}
        </motion.button>
      </AnimatePresence>
`;

code = code.replace(
  /<\/div>\s+<\/div>\s+<\/main>/,
  `</div>\n      </div>\n${buttonCode}\n    </main>`
);

// Also remove hasInteracted as it's no longer needed
code = code.replace(
  /const \[hasInteracted, setHasInteracted\] = useState\(false\);\n/,
  ''
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
