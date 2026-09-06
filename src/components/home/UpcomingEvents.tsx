'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  category: string;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  city: string | null;
  image_url: string | null;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('date', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-24 bg-heat-black relative border-t border-heat-anthracite">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-widest uppercase mb-6 md:mb-0">
            Upcoming Events
          </h2>
        </div>

        {events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-heat-anthracite/30 border border-heat-chrome-dark p-16 text-center rounded-sm"
          >
            <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              NEXT HEAT INCOMING
            </h3>
            <p className="text-heat-chrome mb-8 text-lg">
              New dates will be announced soon. 
            </p>
            <Link 
              href="/community" 
              className="inline-block px-8 py-4 border border-heat-chrome text-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-heat-black transition-all duration-300"
            >
              Join the Community for early access
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden bg-heat-anthracite/30 border border-heat-chrome-dark hover:border-heat-chrome transition-all duration-500"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-all duration-500" />
                  <img 
                    src={event.image_url || '/media/DSC07704.jpg'} 
                    alt={event.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="bg-heat-chrome text-heat-black font-bold uppercase tracking-widest text-xs px-3 py-1">
                      {event.date ? new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : 'TBA'}
                    </span>
                    <span className={`font-bold uppercase tracking-widest text-xs px-3 py-1 ${event.category === 'Heat Night' ? 'bg-heat-red text-white' : 'bg-heat-chrome text-heat-black'}`}>
                      {event.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 relative z-20">
                  <h3 className="font-display text-2xl font-bold text-white mb-3 uppercase tracking-wider group-hover:text-heat-chrome transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-8 text-sm text-heat-chrome-light">
                    <p className="flex items-center">
                      <span className="mr-2 opacity-50">📍</span>
                      {event.location_name ? `${event.location_name}${event.city ? `, ${event.city}` : ''}` : 'TBA'}
                    </p>
                    <p className="flex items-center">
                      <span className="mr-2 opacity-50">🕒</span>
                      {event.start_time ? `${event.start_time.substring(0, 5)}${event.end_time ? ` - ${event.end_time.substring(0, 5)}` : ''}` : 'TBA'}
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link 
                      href={`/events/${event.id}`}
                      className="flex-1 text-center py-3 border border-heat-chrome text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-heat-black transition-colors"
                    >
                      Details
                    </Link>
                    <Link 
                      href={`/events/${event.id}/guestlist`}
                      className="flex-1 text-center py-3 bg-heat-red text-white font-bold uppercase tracking-widest text-xs hover:bg-heat-wine shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_20px_rgba(255,42,42,0.5)] transition-all"
                    >
                      Guestlist
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
