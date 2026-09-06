'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Attempt autoplay
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
      }).catch((err) => {
        console.log('Autoplay prevented by browser. Waiting for interaction.', err);
      });
    }

    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        // Sync with video if present
        const videoEl = document.querySelector('video');
        if (videoEl) {
          audioRef.current.currentTime = videoEl.currentTime;
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        }).catch(console.error);
      }
    };

    // Listen for any interaction to trigger play if autoplay failed
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Sync with video if present
        const videoEl = document.querySelector('video');
        if (videoEl) {
          audioRef.current.currentTime = videoEl.currentTime;
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setHasInteracted(true); // User explicitly interacted
        }).catch(console.error);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/media/aftermovie_audio.mp3" loop />
      
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={togglePlay}
          className="fixed bottom-6 right-6 z-50 p-3 bg-heat-anthracite/80 backdrop-blur-sm border border-heat-chrome-dark rounded-full text-heat-chrome hover:text-white hover:border-heat-chrome transition-all duration-300 shadow-lg group"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          
          {/* Pulsing effect when playing */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border border-heat-red/50 animate-ping" />
          )}
        </motion.button>
      </AnimatePresence>
    </>
  );
}
