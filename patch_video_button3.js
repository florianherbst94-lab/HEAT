const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// The replacement in my previous command failed because the regex `<\/div>\s+<\/div>\s+<\/main>` didn't match!
// The file ends with `</div>\n    </div>\n  );\n}\n` NOT `</main>`

const buttonCode = `
      {/* Mute Toggle Button */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
              
              if (isMuted) {
                // If we are unmuting, make sure it's playing
                videoRef.current.play().catch(e => console.error('Play failed:', e));
              }
            }
          }}
          className="fixed bottom-6 right-6 z-50 p-3 bg-heat-anthracite/80 backdrop-blur-sm border border-heat-chrome-dark rounded-full text-heat-chrome hover:text-white hover:border-heat-chrome transition-all duration-300 shadow-lg group cursor-pointer"
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
  /        <\/AnimatePresence>\n      <\/div>\n    <\/div>\n  \);\n\}/,
  `        </AnimatePresence>\n      </div>\n${buttonCode}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
