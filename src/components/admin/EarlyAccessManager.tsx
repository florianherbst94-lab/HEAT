
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export default function EarlyAccessManager() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    // Fetch ALL pre-registrations regardless of event
    const { data, error } = await supabase
      .from('pre_registrations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setRegistrations(data);
    setLoading(false);
  }

  async function deleteRegistration(id: string) {
    if (!confirm('Bist du sicher, dass du diesen Eintrag löschen möchtest?')) return;
    
    const { error } = await supabase
      .from('pre_registrations')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast.error('Fehler beim Löschen');
    } else {
      toast.success('Eintrag gelöscht');
      fetchRegistrations();
    }
  }

  const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
  const pendingCount = registrations.length - confirmedCount;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm text-center">
          <div className="text-3xl font-bold">{registrations.length}</div>
          <div className="text-sm text-heat-chrome uppercase tracking-wider">Alle Anmeldungen</div>
        </div>
        <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm text-center">
          <div className="text-3xl font-bold text-green-500">{confirmedCount}</div>
          <div className="text-sm text-heat-chrome uppercase tracking-wider">Bestätigt (Opt-In)</div>
        </div>
        <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm text-center">
          <div className="text-3xl font-bold text-yellow-500">{pendingCount}</div>
          <div className="text-sm text-heat-chrome uppercase tracking-wider">Unbestätigt (Wartend)</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-heat-anthracite border border-heat-chrome-dark rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-heat-chrome">Lade Daten...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-heat-black text-heat-chrome">
              <tr>
                <th className="p-4 font-normal uppercase tracking-wider">Email</th>
                <th className="p-4 font-normal uppercase tracking-wider">Name</th>
                <th className="p-4 font-normal uppercase tracking-wider">Status</th>
                <th className="p-4 font-normal uppercase tracking-wider">Datum</th>
                <th className="p-4 font-normal uppercase tracking-wider text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-heat-chrome-dark">
              {registrations.map(reg => (
                <tr key={reg.id} className="hover:bg-heat-black/50 transition-colors">
                  <td className="p-4">{reg.email}</td>
                  <td className="p-4">{reg.first_name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="p-4 text-heat-chrome">
                    {new Date(reg.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteRegistration(reg.id)}
                      className="text-heat-red hover:text-white transition-colors"
                      title="Eintrag löschen"
                    >
                      <svg className="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-heat-chrome">
                    Bisher keine Early Access Anmeldungen vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
