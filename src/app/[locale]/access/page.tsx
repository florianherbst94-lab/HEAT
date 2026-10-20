'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function AccessPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'confirmed'>('idle');
  const [error, setError] = useState('');
  
  const [eventData, setEventData] = useState<{ id: string, date: string, videoUrl: string } | null>(null);

  useEffect(() => {
    // Fetch active pre-registration event
    async function fetchEvent() {
      try {
        const res = await fetch('/api/pre-registration/event');
        if (res.ok) {
          const data = await res.json();
          setEventData(data);
        }
      } catch (err) {
        console.error('Failed to fetch event data:', err);
      }
    }
    fetchEvent();

    // Check URL params for ?confirmed=true
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('confirmed') === 'true') {
        setStatus('confirmed');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    if (!consent) {
      setError('Bitte akzeptiere die Datenschutzerklärung, um fortzufahren.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/pre-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          consentMarketing: consent,
          eventId: eventData?.id,
          source: 'landingpage',
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
      } else {
        setError(data.error || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } catch (err) {
      setError('Ein Netzwerkfehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const videoUrl = eventData?.videoUrl || '/videos/heat-promo.mp4';
  const displayDate = eventData?.date ? new Date(eventData.date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : 'TBA';

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden -mt-24">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-heat-black/40 via-heat-black/20 to-heat-black/80" />
      </div>

      <div className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg flex flex-col items-center text-center"
            >
              {/* Header */}
              <h1 className="mb-6 flex justify-center">
                <img src="/media/logo.png" alt="HEAT" className="h-10 md:h-14 lg:h-16 w-auto drop-shadow-md" />
              </h1>
              <p className="text-xs tracking-[0.3em] text-heat-chrome uppercase mb-12">
                The First Chapter
              </p>

              {/* Main Titles */}
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 leading-none text-transparent bg-clip-text bg-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Feel the<br/>Heat.
              </h2>
              <div className="border border-heat-red/50 bg-heat-black/50 backdrop-blur-sm px-6 py-2 rounded-sm mb-8 inline-block">
                <p className="text-heat-red font-bold tracking-widest uppercase text-sm md:text-base">
                  {displayDate}
                </p>
              </div>

              <p className="text-heat-chrome md:text-lg mb-12 max-w-md mx-auto leading-relaxed">
                Sei der Erste. Erhalte exklusiven Zugang zu unseren günstigsten Ticketpreisen vor dem offiziellen Vorverkaufsstart.
              </p>

              {/* Form */}
              <div className="w-full bg-heat-anthracite/80 backdrop-blur-md border border-heat-chrome-dark p-8 rounded-sm text-left">
                <h3 className="text-2xl font-display font-bold uppercase tracking-widest text-white mb-2 text-center">
                  Early Access Sichern
                </h3>
                <p className="text-heat-chrome text-sm text-center mb-8">
                  Registriere dich jetzt und schalte den exklusiven First-Release Ticketzugang frei.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="E-Mail-Adresse *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-heat-black border border-heat-chrome-dark p-4 rounded-sm text-white placeholder-heat-chrome focus:border-heat-red focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Vorname (Optional)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-heat-black border border-heat-chrome-dark p-4 rounded-sm text-white placeholder-heat-chrome focus:border-heat-red focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="flex items-start gap-3 mt-2">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 appearance-none min-w-[16px] w-4 h-4 border border-heat-chrome-dark bg-heat-black checked:bg-heat-red checked:border-heat-red rounded-sm cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                    />
                    <label htmlFor="consent" className="text-xs text-heat-chrome leading-tight cursor-pointer">
                      Ich bin damit einverstanden, Ticketinformationen und Event-Updates zu erhalten. Ich kann mich jederzeit abmelden. <a href="/privacy" target="_blank" className="underline hover:text-white">Datenschutzerklärung</a>
                    </label>
                  </div>

                  {error && (
                    <div className="text-heat-red text-sm font-bold uppercase tracking-wider text-center mt-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-200 text-heat-black font-bold uppercase tracking-widest py-4 px-6 rounded-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Wird verarbeitet...' : 'Early Access Freischalten'}
                  </button>
                  
                  <p className="text-center text-xs text-heat-chrome/70 mt-2">
                    Limitierte First-Release Tickets. Early Access Mitglieder werden als Erste benachrichtigt.
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-display text-white font-bold tracking-widest uppercase mb-6 drop-shadow-lg">
                Noch ein Schritt<br />bis zur Heat.
              </h2>
              <p className="text-lg text-heat-chrome mb-12 drop-shadow-md">
                Überprüfe deinen Posteingang und bestätige deine E-Mail, um deinen Early Access zu sichern.
              </p>
              <div className="w-16 h-16 border-t-2 border-r-2 border-heat-red rounded-full animate-spin mx-auto opacity-50" />
            </motion.div>
          )}

          {status === 'confirmed' && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-xl mx-auto"
            >
              <div className="w-20 h-20 bg-heat-red/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-heat-red">
                <svg className="w-10 h-10 text-heat-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-display text-white font-bold tracking-widest uppercase mb-6 drop-shadow-lg">
                Du stehst auf der Liste.
              </h2>
              <p className="text-lg text-heat-chrome mb-12 drop-shadow-md">
                Du gehörst zu den Ersten, die erfahren, wann unser exklusiver Ticket-Vorverkauf beginnt.
              </p>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://access.heatdresden.de');
                  alert('Link kopiert!');
                }}
                className="inline-flex items-center gap-2 bg-heat-anthracite border border-heat-chrome-dark hover:border-heat-chrome text-white px-6 py-3 rounded-sm transition-colors text-sm uppercase tracking-wider font-bold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Teilen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
