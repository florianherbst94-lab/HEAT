'use client';

import { motion } from 'framer-motion';

export default function Marquee() {
  const words = [
    'HIP-HOP', 'AFRO', 'R&B', 'AMAPIANO', 'FASHION', 'PEOPLE', 'ENERGY', 'DRESS TO IMPRESS'
  ];

  // Repeat words to make the marquee continuous
  const marqueeText = [...words, ...words, ...words, ...words].join(' · ');

  return (
    <div className="w-full overflow-hidden bg-heat-anthracite border-y border-heat-chrome-dark py-4 whitespace-nowrap flex">
      <motion.div
        className="text-heat-chrome-light font-display text-2xl md:text-4xl tracking-widest font-bold uppercase inline-block"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 20,
        }}
      >
        {marqueeText} &middot; {marqueeText}
      </motion.div>
    </div>
  );
}
