'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function CommunitySignup() {
  const t = useTranslations('Community');
  
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Bitte akzeptiere die Datenschutzbestimmungen.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/community/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          instagram,
          phone: mobileNumber,
          whatsapp_opt_in: true,
          whatsapp_opt_in_source: 'homepage_signup'
        })
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json();
        alert(data.error || 'Es gab einen Fehler bei der Anmeldung. Bitte versuche es später erneut.');
      }
    } catch (err) {
      alert('Netzwerkfehler. Bitte überprüfe deine Verbindung.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 bg-heat-black relative border-t border-heat-anthracite overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-heat-red/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-start w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl mx-auto text-center"
          >
            {status === 'idle' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-4xl md:text-5xl font-bold tracking-widest uppercase drop-shadow-md text-white m-0">
                    {t('title')}
                  </h2>
                  <Link href="/community" className="text-heat-chrome hover:text-white uppercase tracking-wider text-xs font-semibold border border-heat-chrome-dark px-4 py-2 hover:border-white transition-all">
                    Login
                  </Link>
                </div>
                <p className="text-heat-chrome text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed text-left">
                  {t('text')}
                </p>
                
                <form className="w-full flex flex-col space-y-4 relative min-h-[300px]" onSubmit={step === 1 ? handleNextStep : handleSubmit}>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col space-y-4 absolute inset-0 w-full"
                      >
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

                        <button 
                          type="submit" 
                          className="w-full bg-white text-heat-black font-bold uppercase tracking-widest py-4 mt-4 hover:bg-heat-red hover:text-white transition-all duration-300 rounded-sm"
                        >
                          Weiter
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col space-y-4 absolute inset-0 w-full"
                      >
                        <div className="flex items-center gap-4 mb-2">
                          <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            className="text-heat-chrome hover:text-white text-sm"
                          >
                            ← Zurück
                          </button>
                        </div>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
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
      </div>
    </section>
  );
}
