'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GuestlistPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
    instagram: '',
    city: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get or create event
      let { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single();

      if (eventError && eventError.code === 'PGRST116') {
        // Event not found, create a placeholder event for now
        const { data: newEvent, error: createError } = await supabase
          .from('events')
          .insert({
            title: slug.replace(/-/g, ' '),
            slug: slug,
            event_date: new Date().toISOString(),
            location: 'TBA',
          })
          .select()
          .single();
          
        if (createError) throw createError;
        eventData = newEvent;
      } else if (eventError) {
        throw eventError;
      }

      // Insert guestlist entry
      const { error: insertError } = await supabase
        .from('guestlists')
        .insert({
          event_id: eventData?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          birthdate: formData.birthdate,
          instagram: formData.instagram,
          city: formData.city,
        });

      if (insertError) throw insertError;
      
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting guestlist:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-heat-anthracite/50 border border-heat-chrome-dark p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-heat-red/5 rounded-full blur-[80px] pointer-events-none" />

          {submitted ? (
            <div className="text-center py-12">
              <h2 className="font-display text-3xl font-bold text-white mb-4 uppercase tracking-widest">
                Request Received
              </h2>
              <p className="text-heat-chrome-light">
                Deine Anfrage ist eingegangen. Du erhältst eine Nachricht, sobald deine Gästeliste bestätigt wurde.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-widest uppercase mb-2 text-white">
                Guestlist
              </h1>
              <p className="text-heat-chrome mb-8 text-sm">
                Apply for the guestlist for: <strong className="text-white uppercase">{slug.replace(/-/g, ' ')}</strong>
              </p>

              {error && (
                <div className="bg-heat-red/20 border border-heat-red text-heat-red p-4 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Vorname *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Nachname *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">E-Mail *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Telefonnummer</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Geburtstag *</label>
                    <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Instagram Name</label>
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@" className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Wohnort</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                </div>

                <div className="pt-4 space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-xs text-heat-chrome leading-relaxed">
                      Ich stimme den Einlassbedingungen zu. (Mindestalter, Dresscode etc. garantieren keinen automatischen Einlass). *
                    </span>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-xs text-heat-chrome leading-relaxed">
                      Ich akzeptiere die Datenschutzbestimmungen. *
                    </span>
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-heat-black font-bold uppercase tracking-widest py-4 mt-4 hover:bg-heat-red hover:text-white transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Wird gesendet...' : 'Anfrage Senden'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
