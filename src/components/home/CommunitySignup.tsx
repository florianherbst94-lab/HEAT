'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function CommunitySignup() {
  const t = useTranslations('Community');

  return (
    <section className="py-32 bg-heat-black relative border-t border-heat-anthracite">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-heat-red/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-heat-anthracite/50 backdrop-blur-md border border-heat-chrome-dark p-8 md:p-16 text-center shadow-2xl"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-widest uppercase mb-6 drop-shadow-md">
            {t('title')}
          </h2>
          <p className="text-heat-chrome-light text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('text')}
          </p>
          
          <form className="max-w-md mx-auto flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="text" 
              placeholder="Name" 
              className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-heat-chrome-dark"
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-heat-chrome-dark"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-white text-heat-black font-bold uppercase tracking-widest py-4 mt-2 hover:bg-heat-red hover:text-white transition-colors duration-300"
            >
              {t('button')}
            </button>
            <p className="text-xs text-heat-chrome mt-4">
              By joining, you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
