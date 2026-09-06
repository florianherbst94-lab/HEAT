'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useParams, useRouter } from 'next/navigation';
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
  description: string | null;
  music_genres: string | null;
  min_age: number | null;
  artists: string | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', slug)
          .single();

        if (error) throw error;
        if (!data) router.push('/404');
        
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug, router]);

  if (loading) {
    return <main className="min-h-screen bg-heat-black flex justify-center items-center"><div className="text-heat-chrome">Loading...</div></main>;
  }

  if (!event) {
    return null; // Handled by router.push
  }

  return (
    <main className="min-h-screen bg-heat-black">
      {/* Event Hero */}
      <section className="relative pt-40 pb-32 px-6 flex items-center justify-center min-h-[70vh] border-b border-heat-anthracite">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center" 
          style={{ backgroundImage: `url(${event.image_url || '/media/DSC04419.jpg'})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-heat-black via-heat-black/50 to-transparent" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className={`inline-block px-4 py-1 border font-bold text-sm tracking-widest uppercase mb-6 ${event.category === 'Heat Day' ? 'border-heat-chrome text-heat-black bg-heat-chrome' : 'border-heat-red text-heat-red bg-heat-red/10'}`}>
              {event.category}
            </span>
            <h1 className="font-display text-5xl md:text-8xl font-bold tracking-wider text-white mb-6 uppercase">
              {event.title}
            </h1>
            <p className="text-xl md:text-2xl text-heat-chrome-light font-light mb-8 uppercase">
              {event.date ? new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : 'TBA'} | {event.city || 'TBA'} | {event.location_name || 'TBA'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/tickets" className="px-8 py-4 bg-heat-red text-white font-bold uppercase tracking-wider text-sm hover:bg-heat-wine transition-all duration-300">
                Get Tickets
              </Link>
              <Link href={`/events/${slug}/guestlist`} className="px-8 py-4 border border-white text-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-heat-black transition-all duration-300">
                Apply for Guestlist
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-24 px-6 container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-2 text-heat-chrome-light space-y-6">
            <h2 className="font-display text-3xl text-white uppercase tracking-widest mb-6">About The Event</h2>
            
            <div className="space-y-4 whitespace-pre-wrap">
              {event.description || (
                <>
                  <p>
                    More information about this event will be published soon. Get ready for an unforgettable night with the best of Hip-Hop, Afro, R&B, and Amapiano.
                  </p>
                  <p>
                    Dresscode: <strong>Dress to impress.</strong> Make sure your outfit matches the Heat vibe.
                  </p>
                </>
              )}
            </div>
            
          </div>
          
          <div className="space-y-8">
            <div className="bg-heat-anthracite/50 p-6 border border-heat-chrome-dark">
              <h3 className="text-white font-bold uppercase tracking-wider mb-4 border-b border-heat-chrome-dark pb-2">Lineup</h3>
              <ul className="text-heat-chrome space-y-2">
                <li>{event.artists || 'TBA'}</li>
              </ul>
            </div>
            <div className="bg-heat-anthracite/50 p-6 border border-heat-chrome-dark">
              <h3 className="text-white font-bold uppercase tracking-wider mb-4 border-b border-heat-chrome-dark pb-2">Info</h3>
              <ul className="text-heat-chrome space-y-2 text-sm">
                <li><strong>Age:</strong> {event.min_age || 18}+</li>
                <li><strong>Music:</strong> {event.music_genres || 'TBA'}</li>
                <li><strong>Start:</strong> {event.start_time ? `${event.start_time.substring(0, 5)}${event.end_time ? ` - ${event.end_time.substring(0, 5)}` : ''}` : 'TBA'}</li>
                <li><strong>Location:</strong> {event.location_name || 'TBA'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
