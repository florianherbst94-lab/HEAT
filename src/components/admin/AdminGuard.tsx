'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Lock, LogOut, Loader2, KeyRound } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError(data.error || 'Falsches Passwort');
      }
    } catch {
      setError('Verbindungsfehler beim Anmelden');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-heat-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-heat-chrome animate-spin" />
          <p className="text-heat-chrome text-xs uppercase tracking-widest">Sicherheitsprotokoll wird geprüft...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-heat-black flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-md bg-heat-anthracite/40 border border-heat-chrome-dark p-8 md:p-10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-heat-red/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-heat-chrome/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-heat-anthracite border border-heat-chrome-dark flex items-center justify-center rounded-full text-heat-chrome">
              <Lock className="w-8 h-8 text-heat-red" />
            </div>
            <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-1 block">
              Restricted Access
            </span>
            <h1 className="font-display text-2xl font-bold tracking-widest text-white uppercase">
              Heat Admin Access
            </h1>
            <p className="text-heat-chrome-light text-xs mt-2">
              Zugang nur für autorisierte Administratoren
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs uppercase tracking-wider text-heat-chrome font-bold mb-2">
                Admin-Passwort
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-heat-chrome absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                  required
                  className="w-full bg-heat-black border border-heat-chrome-dark pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-heat-chrome text-sm transition-colors rounded-sm"
                />
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
              className="w-full py-3.5 bg-heat-red text-white font-bold uppercase tracking-widest text-xs hover:bg-heat-wine shadow-[0_0_20px_rgba(255,42,42,0.3)] hover:shadow-[0_0_25px_rgba(255,42,42,0.5)] transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Prüfe...
                </>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Admin Action Bar */}
      <div className="bg-heat-anthracite/90 border-b border-heat-chrome-dark backdrop-blur-md fixed top-0 left-0 right-0 z-50 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-green-400 font-bold uppercase tracking-wider text-[10px] bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Admin Authentifiziert
          </span>
          <Link
            href="/admin"
            className="text-heat-chrome hover:text-white transition-colors font-semibold uppercase tracking-wider hidden sm:inline"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/check-in"
            className="text-heat-chrome hover:text-white transition-colors font-semibold uppercase tracking-wider hidden sm:inline"
          >
            Door Check-In
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-heat-chrome hover:text-heat-red transition-colors font-bold uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5" />
          Abmelden
        </button>
      </div>

      <div className="pt-8">
        {children}
      </div>
    </>
  );
}
