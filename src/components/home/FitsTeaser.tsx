'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Trophy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface FitEntry {
  id: string;
  image_url: string;
  author_name?: string;
  instagram_handle?: string;
  votes_count?: number;
  winners?: { badge_title: string }[];
}

export default function FitsTeaser() {
  const t = useTranslations('Fits');
  const [entries, setEntries] = useState<FitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopFits() {
      try {
        const res = await fetch('/api/fits/entries?sort=hottest');
        const data = await res.json();
        setEntries((data.entries || []).slice(0, 4));
      } catch (err) {
        console.error('Fits teaser fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopFits();
  }, []);

  return (
    <section className="py-24 bg-heat-black relative border-t border-heat-anthracite overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-heat-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-2 block flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-heat-red" />
              HEAT FITS EDITION
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-wider text-white uppercase">
              YOUR LOOK. YOUR HEAT.
            </h2>
            <p className="text-heat-chrome-light text-sm md:text-base font-light mt-2 max-w-lg">
              Show us how you bring the HEAT. Vote for the hottest looks and win guestlist spots for the next event.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/fits"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-heat-red text-white font-bold uppercase tracking-widest text-xs hover:bg-heat-wine shadow-[0_0_20px_rgba(255,42,42,0.3)] hover:shadow-[0_0_25px_rgba(255,42,42,0.5)] transition-all rounded-sm"
            >
              {t('discover_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Top Fits Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-heat-anthracite/40 border border-heat-chrome-dark rounded-sm" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-heat-anthracite/30 border border-heat-chrome-dark p-8 rounded-sm">
            <Flame className="w-10 h-10 text-heat-chrome mx-auto mb-3 opacity-60" />
            <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-1">
              NEXT HEAT FITS COMING SOON
            </h3>
            <p className="text-heat-chrome text-xs">
              Die nächste HEAT FITS Campaign startet in Kürze vor dem nächsten Event.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative aspect-[3/4] bg-zinc-950 border border-heat-chrome-dark/80 rounded-sm overflow-hidden shadow-xl"
              >
                <img
                  src={entry.image_url}
                  alt={entry.author_name || 'HEAT Fit'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-heat-black via-transparent to-transparent opacity-80" />

                {entry.winners && entry.winners.length > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      WINNER
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-white text-xs font-bold truncate">
                    {entry.instagram_handle ? `@${entry.instagram_handle}` : entry.author_name}
                  </span>
                  <span className="text-heat-red text-xs font-extrabold flex items-center gap-1 bg-heat-black/80 px-2 py-1 rounded border border-heat-chrome-dark">
                    <Flame className="w-3 h-3 fill-heat-red" />
                    {entry.votes_count || 0}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
