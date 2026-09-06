'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      {/* Hero Section */}
      <section className="relative px-6 mb-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-heat-red font-bold uppercase tracking-widest text-sm mb-4 block">
              The Concept
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-widest uppercase text-white mb-6">
              More than a party
            </h1>
            <p className="text-heat-chrome-light text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Heat is the intersection of Hip-Hop, Afro, R&B, Amapiano, Fashion, and a community that prepares consciously for every event.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] w-full"
            >
              <div className="absolute inset-0 bg-heat-red/20 translate-x-4 translate-y-4" />
              <img 
                src="/media/DSC04419.jpg" 
                alt="Heat Party Crowd" 
                className="w-full h-full object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4 text-heat-chrome-light text-lg font-light leading-relaxed">
                <p>
                  We believe that the energy of a night starts long before you enter the club. It starts when you pick your outfit, when you link up with your friends, and when you feel that anticipation building up.
                </p>
                <p>
                  <strong>Heat</strong> is curated for those who put effort into their appearance and their vibe. Strong looks, extraordinary people, and an energy that stays high until the very last track drops.
                </p>
                <p>
                  Musically, we focus on the sounds that make you move. From the heavy basslines of modern Hip-Hop to the rhythmic grooves of Afrobeat and Amapiano, blended with smooth R&B classics.
                </p>
              </div>

              <div className="pt-8 border-t border-heat-chrome-dark">
                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-4">Dresscode</h3>
                <p className="text-heat-chrome mb-6">
                  Dress to impress. Streetwear with a high-fashion edge. No effort, no entry. Our door staff reserves the right to select the crowd to maintain the unique Heat vibe.
                </p>
                <Link 
                  href="/events"
                  className="inline-block px-8 py-4 bg-heat-red text-white font-bold uppercase tracking-wider text-sm hover:bg-heat-wine transition-colors"
                >
                  Experience Heat
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
