'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const t = useTranslations('Hero');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(e => console.log('Video autoplay prevented', e));
    }
  }, []);

  // Will be replaced with actual video background later
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-heat-black">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          src="/media/aftermovie_web.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-heat-black/80 via-heat-black/40 to-heat-black z-10" />

      <div className="relative z-20 text-center flex flex-col items-center px-4 w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-8"
        >
          <img src="/media/logo.png" alt="Heat Logo" className="h-24 md:h-40 w-auto object-contain mx-auto" />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-heat-chrome text-sm md:text-lg tracking-[0.3em] uppercase mb-8"
        >
          {t('genres')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="font-display text-2xl md:text-5xl font-bold leading-tight mb-16 text-white"
        >
          <p className="mb-2">DRESS UP.</p>
          <p className="mb-2">SHOW UP.</p>
          <p className="text-heat-red drop-shadow-[0_0_10px_rgba(255,42,42,0.6)]">FEEL THE HEAT.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col items-center space-y-6"
        >
          <p className="text-heat-chrome uppercase tracking-widest text-sm mb-2">{t('coming_soon')}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/events" 
              className="px-8 py-4 bg-heat-red text-white font-bold uppercase tracking-wider text-sm hover:bg-heat-wine transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,42,42,0.5)]"
            >
              {t('discover_events')}
            </Link>
            <Link 
              href="/community" 
              className="px-8 py-4 border border-heat-chrome text-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-heat-black transition-all duration-300"
            >
              {t('join_community')}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Sound Control Toggle will be added here later */}
    </section>
  );
}
