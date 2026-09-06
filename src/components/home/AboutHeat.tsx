'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function AboutHeat() {
  const t = useTranslations('About');

  return (
    <section className="py-32 px-6 bg-heat-black relative overflow-hidden">
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h2 className="text-heat-red font-display text-4xl md:text-6xl font-bold mb-12 tracking-widest uppercase">
            About Heat
          </h2>
          <p className="font-sans text-xl md:text-3xl text-heat-chrome-light leading-relaxed font-light">
            "{t('text')}"
          </p>
        </motion.div>
      </div>
      
      {/* Decorative blurry background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-heat-wine/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-heat-red/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 mix-blend-screen" />
    </section>
  );
}
