
'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function CommunitySignup() {
  const t = useTranslations('Community');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Bitte akzeptiere die Datenschutzbestimmungen.');
      return;
    }
    
    setLoading(true);
    // TODO: Connect to backend API later
    // For now we just simulate success
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
    }, 1000);
  };

  return (
    <section className="py-32 bg-heat-black relative border-t border-heat-anthracite overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-heat-red/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-xl mx-auto text-center"
        >
          {status === 'idle' ? (
            <>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-widest uppercase mb-6 drop-shadow-md text-white">
                {t('title')}
              </h2>
              <p className="text-heat-chrome text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                {t('text')}
              </p>
              
              <form className="w-full flex flex-col space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Vorname*" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-heat-anthracite/50 backdrop-blur-md border border-heat-chrome-dark px-4 py-3.5 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-zinc-600 rounded-sm"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Nachname*" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-heat-anthracite/50 backdrop-blur-md border border-heat-chrome-dark px-4 py-3.5 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-zinc-600 rounded-sm"
                    required
                  />
                </div>
                
                <input 
                  type="email" 
                  placeholder="Email*" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-heat-anthracite/50 backdrop-blur-md border border-heat-chrome-dark px-4 py-3.5 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-zinc-600 rounded-sm"
                  required
                />
                
                <input 
                  type="text" 
                  placeholder="Instagram*" 
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-heat-anthracite/50 backdrop-blur-md border border-heat-chrome-dark px-4 py-3.5 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-zinc-600 rounded-sm"
                  required
                />
                
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-heat-anthracite/50 backdrop-blur-md border border-heat-chrome-dark px-4 py-3.5 text-white focus:outline-none focus:border-heat-red transition-colors placeholder:text-zinc-600 rounded-sm"
                />

                <div className="flex items-start gap-3 mt-2 text-left">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      id="club-consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-heat-chrome-dark bg-heat-black accent-heat-red"
                      required
                    />
                  </div>
                  <label htmlFor="club-consent" className="text-xs text-heat-chrome leading-relaxed cursor-pointer">
                    Ich stimme zu, dass meine Daten zur Anmeldung für den HEAT CLUB verarbeitet werden. 
                    Weitere Informationen findest du in unserer{' '}
                    <Link href="/de/privacy" target="_blank" className="text-white underline hover:text-heat-red transition-colors">
                      Datenschutzerklärung
                    </Link>.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-heat-black font-bold uppercase tracking-widest py-4 mt-4 hover:bg-heat-red hover:text-white transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird angemeldet...' : t('button')}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-4xl font-display text-white font-bold tracking-widest uppercase mb-6">
                Willkommen im Club.
              </h2>
              <p className="text-lg text-heat-chrome mb-12">
                Deine Anmeldung war erfolgreich.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
