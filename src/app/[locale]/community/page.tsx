'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Ticket,
  Users,
  Check,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  LogOut,
  Settings,
  Image as ImageIcon,
  KeyRound,
  Edit,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CommunityPage() {
  // Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [member, setMember] = useState<any | null>(null);
  const [campaignQuota, setCampaignQuota] = useState<any | null>(null);

  // Tab mode for unauthenticated users
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [is18Plus, setIs18Plus] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [whatsAppOptIn, setWhatsAppOptIn] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');

  // Profile Edit Form state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editWhatsAppOptIn, setEditWhatsAppOptIn] = useState(false);
  const [editEmailOptIn, setEditEmailOptIn] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/community/me');
      const data = await res.json();
      if (data.authenticated && data.member) {
        setIsAuthenticated(true);
        setMember(data.member);
        setCampaignQuota(data.campaign);
        setEditFirstName(data.member.first_name || '');
        setEditLastName(data.member.last_name || '');
        setEditPhone(data.member.phone || '');
        setEditInstagram(data.member.instagram || '');
        setEditWhatsAppOptIn(!!data.member.whatsapp_opt_in);
        setEditEmailOptIn(!!data.member.email_marketing_opt_in);
      } else {
        setIsAuthenticated(false);
        setMember(null);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) {
      setError('Vorname und E-Mail sind erforderlich.');
      return;
    }
    if (!is18Plus) {
      setError('Du musst mindestens 18 Jahre alt sein, um dem HEAT CLUB beizutreten.');
      return;
    }
    if (!termsAccepted) {
      setError('Bitte stimme den Datenschutzbestimmungen zu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/community/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          instagram,
          is_18_plus: is18Plus,
          terms_accepted: termsAccepted,
          whatsapp_opt_in: whatsAppOptIn,
          whatsapp_opt_in_source: 'community_homepage',
          email_marketing_opt_in: emailOptIn,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        checkSession();
      } else {
        setError(data.error || 'Registrierung fehlgeschlagen.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setError('Bitte gib deine E-Mail Adresse ein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/community/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        checkSession();
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/community/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editFirstName,
          last_name: editLastName,
          phone: editPhone,
          instagram: editInstagram,
          whatsapp_opt_in: editWhatsAppOptIn,
          email_marketing_opt_in: editEmailOptIn,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setEditingProfile(false);
        checkSession();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error || 'Profil konnte nicht gespeichert werden.');
      }
    } catch {
      setError('Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/community/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setMember(null);
  };

  return (
    <main className="min-h-screen bg-heat-black text-white pt-32 pb-24 relative overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-heat-red/10 rounded-full blur-[140px] pointer-events-none" />

      <section className="px-6 relative z-10 container mx-auto max-w-5xl">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-3 block">
              INNER CIRCLE MEMBER PORTAL
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-widest text-white uppercase mb-3">
              HEAT CLUB
            </h1>
            <p className="font-display text-lg md:text-xl font-bold tracking-widest text-heat-red uppercase mb-4">
              &quot;Not an audience. A community.&quot;
            </p>
          </motion.div>
        </div>

        {/* LOGGED IN MEMBER DASHBOARD */}
        {isAuthenticated && member ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            {/* Member Pass Badge Card */}
            <div className="bg-gradient-to-br from-heat-anthracite/80 via-heat-black to-zinc-950 border border-heat-red/60 p-8 md:p-10 rounded-sm relative overflow-hidden shadow-[0_0_50px_rgba(255,42,42,0.25)]">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Flame className="w-48 h-48 text-heat-red" />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] font-extrabold uppercase tracking-widest rounded">
                      <UserCheck className="w-3 h-3 inline mr-1" />
                      ACTIVE MEMBER
                    </span>
                    <span className="text-heat-chrome text-xs font-mono font-bold">
                      {member.email}
                    </span>
                  </div>
                  <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-widest text-white uppercase">
                    {member.first_name} {member.last_name || ''}
                  </h2>
                  <p className="text-heat-red font-display text-2xl md:text-3xl font-black tracking-widest mt-1">
                    {member.member_number}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="px-5 py-2.5 bg-heat-black border border-heat-chrome-dark text-white font-bold uppercase tracking-wider text-xs hover:border-heat-red transition-colors flex items-center gap-2 rounded-sm"
                  >
                    <Settings className="w-4 h-4 text-heat-red" />
                    {editingProfile ? 'Abbrechen' : 'Profil Bearbeiten'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-heat-anthracite/60 border border-heat-chrome-dark text-zinc-400 hover:text-heat-red font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2 rounded-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Abmelden
                  </button>
                </div>
              </div>

              {/* Voting Quota Strip */}
              {campaignQuota && (
                <div className="mt-8 pt-6 border-t border-heat-chrome-dark/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-heat-red fill-heat-red animate-pulse" />
                    <div>
                      <span className="text-xs text-heat-chrome uppercase font-bold tracking-wider block">
                        HEAT FITS VOTING QUOTA
                      </span>
                      <span className="text-sm text-white font-bold">
                        {campaignQuota.remaining_votes} von {campaignQuota.max_votes} HEAT Votes verfügbar
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/fits"
                    className="px-5 py-2 bg-heat-red text-white text-xs font-bold uppercase tracking-wider hover:bg-heat-wine transition-all flex items-center gap-2 rounded-sm"
                  >
                    ZUR FITS GALERIE <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Edit Form / Details Section */}
            <AnimatePresence>
              {editingProfile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-heat-anthracite/40 border border-heat-chrome-dark p-6 md:p-8 rounded-sm space-y-6"
                >
                  <h3 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-heat-red" />
                    Mitgliedsdaten Aktualisieren
                  </h3>

                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-heat-chrome font-bold uppercase mb-1">Vorname *</label>
                        <input
                          type="text"
                          required
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white rounded-sm text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-heat-chrome font-bold uppercase mb-1">Nachname</label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white rounded-sm text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-heat-chrome font-bold uppercase mb-1">Instagram Handle</label>
                        <input
                          type="text"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          placeholder="@handle"
                          className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white rounded-sm text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-heat-chrome font-bold uppercase mb-1">WhatsApp / Mobilnummer</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+49..."
                          className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white rounded-sm text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-heat-chrome-dark">
                      <span className="text-[11px] font-bold text-heat-chrome uppercase tracking-wider block">
                        Marketing Benachrichtigungen
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editWhatsAppOptIn}
                          onChange={(e) => setEditWhatsAppOptIn(e.target.checked)}
                          className="accent-heat-red"
                        />
                        <span className="text-white">HEAT Updates & Secret Drops per WhatsApp erhalten</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editEmailOptIn}
                          onChange={(e) => setEditEmailOptIn(e.target.checked)}
                          className="accent-heat-red"
                        />
                        <span className="text-white">HEAT Newsletter per E-Mail erhalten</span>
                      </label>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-sm text-center text-red-400">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-heat-red text-white font-bold uppercase tracking-wider hover:bg-heat-wine transition-colors rounded-sm flex items-center gap-2 text-xs"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Speichere...' : 'ÄNDERUNGEN SPEICHERN'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {saveSuccess && (
              <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-sm text-center text-green-400 text-xs font-bold">
                PROFIL ERFOLGREICH AKTUALISIERT!
              </div>
            )}
          </motion.div>
        ) : (
          /* UNAUTHENTICATED MEMBER SECTION */
          <div className="space-y-16">
            {/* 3 Pillars Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-8 rounded-sm hover:border-heat-red/60 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-heat-red font-display text-4xl font-extrabold block mb-4">01</span>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-heat-red" />
                    HEAT FITS
                  </h3>
                  <p className="text-heat-chrome text-sm font-light leading-relaxed mb-6">
                    Show your style and vote for the hottest looks. Win Guestlist spots, Fast Lane access and HEAT perks.
                  </p>
                </div>
                <Link
                  href="/fits"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-heat-red transition-colors"
                >
                  DISCOVER FITS <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-8 rounded-sm hover:border-heat-red/60 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-heat-red font-display text-4xl font-extrabold block mb-4">02</span>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-heat-red" />
                    HEAT DROPS
                  </h3>
                  <p className="text-heat-chrome text-sm font-light leading-relaxed mb-6">
                    Guestlist spots, early access to limited tickets, and secret event releases exclusively for members.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-400">
                  <ShieldCheck className="w-4 h-4" /> ACTIVE MEMBER PERKS
                </span>
              </div>

              <div className="bg-heat-anthracite/20 border border-heat-chrome-dark/50 p-8 rounded-sm opacity-80 flex flex-col justify-between relative">
                <div>
                  <span className="text-zinc-600 font-display text-4xl font-extrabold block mb-4">03</span>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-zinc-400" />
                    HEAT PEOPLE
                  </h3>
                  <p className="text-heat-chrome text-sm font-light leading-relaxed mb-6">
                    Meet the people who make HEAT what it is. Connect with creators, DJs, models & tastemakers.
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-full w-fit">
                  COMING SOON
                </span>
              </div>
            </div>

            {/* Registration / Login Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-heat-anthracite/50 border border-heat-chrome-dark p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-heat-red via-heat-wine to-heat-magenta" />

              {/* Mode Toggle Switcher */}
              <div className="flex justify-center mb-8 border-b border-heat-chrome-dark/60 pb-4 gap-4">
                <button
                  onClick={() => setMode('register')}
                  className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all ${
                    mode === 'register' ? 'text-heat-red border-b-2 border-heat-red' : 'text-heat-chrome hover:text-white'
                  }`}
                >
                  HEAT CLUB BEITRETEN
                </button>
                <span className="text-heat-chrome-dark">|</span>
                <button
                  onClick={() => setMode('login')}
                  className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all ${
                    mode === 'login' ? 'text-heat-red border-b-2 border-heat-red' : 'text-heat-chrome hover:text-white'
                  }`}
                >
                  ANMELDEN (LOGIN)
                </button>
              </div>

              {mode === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Vorname *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Vorname eingeben"
                        className="w-full bg-heat-black border border-heat-chrome-dark p-3.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Nachname (Optional)
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Nachname eingeben"
                        className="w-full bg-heat-black border border-heat-chrome-dark p-3.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                      E-Mail Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.com"
                      className="w-full bg-heat-black border border-heat-chrome-dark p-3.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Instagram Handle (Optional)
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@yourhandle"
                        className="w-full bg-heat-black border border-heat-chrome-dark p-3.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Mobilnummer / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+49 170 1234567"
                        className="w-full bg-heat-black border border-heat-chrome-dark p-3.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-heat-anthracite text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is18Plus}
                        onChange={(e) => setIs18Plus(e.target.checked)}
                        className="accent-heat-red"
                        required
                      />
                      <span className="text-white font-bold">Ich bin mindestens 18 Jahre alt. *</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 accent-heat-red"
                        required
                      />
                      <span className="text-heat-chrome-light leading-snug">
                        Ich stimme der Speicherung meiner Daten gemäß Datenschutzerklärung für den HEAT CLUB zu. *
                      </span>
                    </label>

                    <div className="pt-3 border-t border-heat-anthracite/60 space-y-2.5">
                      <span className="text-[11px] font-bold text-heat-chrome uppercase tracking-wider block">
                        Einwilligung Marketing-Kommunikation (Optional)
                      </span>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsAppOptIn}
                          onChange={(e) => setWhatsAppOptIn(e.target.checked)}
                          className="mt-0.5 accent-heat-red"
                        />
                        <span className="text-heat-chrome-light leading-snug">
                          Ich möchte HEAT Updates, Guestlist Drops, Event News und Community Aktionen per WhatsApp erhalten.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailOptIn}
                          onChange={(e) => setEmailOptIn(e.target.checked)}
                          className="mt-0.5 accent-heat-red"
                        />
                        <span className="text-heat-chrome-light leading-snug">
                          Ich möchte HEAT Updates per E-Mail erhalten.
                        </span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-sm text-center">
                      <p className="text-red-400 text-xs font-semibold">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-heat-red hover:text-white transition-colors duration-300 shadow-xl disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Generiere Member ID...' : 'JETZT DEM HEAT CLUB BEITRETEN'}
                  </button>
                </form>
              ) : (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-6 text-left">
                  <div className="text-center mb-6">
                    <p className="text-heat-chrome text-xs">
                      Gib die E-Mail Adresse deines HEAT CLUB Kontos ein, um dich anzumelden.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                      E-Mail Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="deine@email.com"
                      className="w-full bg-heat-black border border-heat-chrome-dark p-3.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-sm text-center">
                      <p className="text-red-400 text-xs font-semibold">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-heat-red text-white font-bold uppercase tracking-widest text-sm hover:bg-heat-wine transition-colors duration-300 shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Prüfe Konto...' : 'ANMELDEN'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </section>
    </main>
  );
}
