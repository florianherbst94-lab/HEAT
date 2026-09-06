'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Flame,
  MessageSquare,
  Mail,
  Download,
  Search,
  Check,
  X,
  Eye,
  Trash2,
  Trophy,
  Plus,
  Copy,
  Edit,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function CommunityManager() {
  const [subTab, setSubTab] = useState<'dashboard' | 'members' | 'campaigns' | 'moderation' | 'winners'>('dashboard');

  // Dashboard Data
  const [kpis, setKpis] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pendingEntries, setPendingEntries] = useState<any[]>([]);
  const [campaignEntries, setCampaignEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [optInFilter, setOptInFilter] = useState<'all' | 'whatsapp' | 'email'>('all');

  // Campaign Form Modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

  // Winner Form
  const [selectedWinnerEntry, setSelectedWinnerEntry] = useState<any | null>(null);
  const [winnerType, setWinnerType] = useState<'community_winner' | 'heat_choice' | 'wildcard' | 'guestlist_winner'>('community_winner');
  const [badgeTitle, setBadgeTitle] = useState('🏆 COMMUNITY WINNER');

  useEffect(() => {
    fetchCommunityData();
    fetchFitsData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      const res = await fetch('/api/admin/community');
      const data = await res.json();
      if (data.kpis) setKpis(data.kpis);
      if (data.members) setMembers(data.members);
    } catch (err) {
      console.error('Fetch admin community error:', err);
    }
  };

  const fetchFitsData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fits');
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
      if (data.pendingEntries) setPendingEntries(data.pendingEntries);
      if (data.campaignEntries) setCampaignEntries(data.campaignEntries);
    } catch (err) {
      console.error('Fetch admin fits error:', err);
    } finally {
      setLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    window.open('/api/admin/community?format=csv', '_blank');
  };

  // Member Delete
  const handleDeleteMember = async (id: string) => {
    if (!confirm('Möchtest du dieses Mitglied wirklich löschen?')) return;
    try {
      await fetch(`/api/admin/community?id=${id}`, { method: 'DELETE' });
      setMembers(prev => prev.filter(m => m.id !== id));
      fetchCommunityData();
    } catch (err) {
      console.error('Delete member error:', err);
    }
  };

  // Moderation Handler
  const handleModerateEntry = async (entryId: string, status: 'approved' | 'rejected' | 'hidden') => {
    try {
      await fetch('/api/admin/fits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate_entry', entry_id: entryId, status }),
      });
      setPendingEntries(prev => prev.filter(e => e.id !== entryId));
      fetchFitsData();
    } catch (err) {
      console.error('Moderate entry error:', err);
    }
  };

  // Delete Entry Handler
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Möchtest du dieses Outfit unwiderruflich löschen?')) return;
    try {
      await fetch('/api/admin/fits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_entry', entry_id: entryId }),
      });
      setPendingEntries(prev => prev.filter(e => e.id !== entryId));
      fetchFitsData();
    } catch (err) {
      console.error('Delete entry error:', err);
    }
  };

  // Duplicate Campaign
  const handleDuplicateCampaign = async (campaignId: string) => {
    try {
      await fetch('/api/admin/fits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate_campaign', campaign_id: campaignId }),
      });
      fetchFitsData();
    } catch (err) {
      console.error('Duplicate campaign error:', err);
    }
  };

  // Save Campaign
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/fits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_campaign', campaign: editingCampaign }),
      });
      setShowCampaignModal(false);
      setEditingCampaign(null);
      fetchFitsData();
    } catch (err) {
      console.error('Save campaign error:', err);
    }
  };

  // Assign Winner Badge
  const handleAssignWinner = async () => {
    if (!selectedWinnerEntry) return;
    try {
      await fetch('/api/admin/fits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_winner',
          campaign_id: selectedWinnerEntry.campaign_id,
          entry_id: selectedWinnerEntry.id,
          winner_type: winnerType,
          badge_title: badgeTitle,
        }),
      });
      setSelectedWinnerEntry(null);
      fetchFitsData();
    } catch (err) {
      console.error('Assign winner error:', err);
    }
  };

  // Filtered Members
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      (m.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.member_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.instagram || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (optInFilter === 'whatsapp') return matchesSearch && m.whatsapp_opt_in;
    if (optInFilter === 'email') return matchesSearch && m.email_marketing_opt_in;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-heat-chrome-dark pb-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Users },
          { id: 'members', label: `Mitglieder (${members.length})`, icon: Users },
          { id: 'campaigns', label: `Campaigns (${campaigns.length})`, icon: Flame },
          { id: 'moderation', label: `Freigaben (${pendingEntries.length})`, icon: Clock, badge: pendingEntries.length },
          { id: 'winners', label: 'Gewinner & Leaderboard', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm flex items-center gap-2 relative ${
                subTab === tab.id
                  ? 'bg-heat-red text-white shadow-[0_0_15px_rgba(255,42,42,0.4)]'
                  : 'bg-heat-anthracite/50 text-heat-chrome hover:text-white border border-heat-chrome-dark'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge ? (
                <span className="ml-1 bg-white text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: DASHBOARD KPIs */}
      {subTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-5 rounded-sm">
              <span className="text-heat-chrome text-xs font-bold uppercase tracking-wider block">TOTAL MEMBERS</span>
              <span className="text-3xl font-display font-extrabold text-white mt-1 block">{kpis?.total_members || members.length}</span>
            </div>
            <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-5 rounded-sm">
              <span className="text-heat-chrome text-xs font-bold uppercase tracking-wider block">NEW (7 DAYS)</span>
              <span className="text-3xl font-display font-extrabold text-green-400 mt-1 block">+{kpis?.new_members_7d || 0}</span>
            </div>
            <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-5 rounded-sm">
              <span className="text-heat-chrome text-xs font-bold uppercase tracking-wider block">WHATSAPP OPT-INS</span>
              <span className="text-3xl font-display font-extrabold text-green-500 mt-1 block">{kpis?.whatsapp_opt_ins || 0}</span>
            </div>
            <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-5 rounded-sm">
              <span className="text-heat-chrome text-xs font-bold uppercase tracking-wider block">EMAIL OPT-INS</span>
              <span className="text-3xl font-display font-extrabold text-white mt-1 block">{kpis?.email_opt_ins || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-6 rounded-sm">
              <h3 className="font-display text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-heat-red" />
                Aktive Campaign Status
              </h3>
              <p className="text-heat-chrome text-sm font-semibold mb-1">
                {kpis?.active_campaign_title || 'HEAT FITS – September Edition'}
              </p>
              <div className="mt-4 pt-4 border-t border-heat-chrome-dark flex justify-between items-center text-xs">
                <span className="text-heat-chrome font-bold uppercase">Pending Uploads zur Moderation:</span>
                <span className="text-heat-red font-extrabold text-base">{pendingEntries.length}</span>
              </div>
            </div>

            <div className="bg-heat-anthracite/40 border border-heat-chrome-dark p-6 rounded-sm">
              <h3 className="font-display text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                Lead-Export & Compliance
              </h3>
              <p className="text-heat-chrome text-xs leading-relaxed mb-4">
                Exportiere die vollständige Mitgliederliste inklusive Zeitstempeln und Opt-In Status als CSV-Datei für E-Mail / WhatsApp-Kampagnen.
              </p>
              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-xs transition-colors rounded-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV Export Runterladen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: MEMBERS TABLE */}
      {subTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-heat-anthracite/40 p-4 border border-heat-chrome-dark rounded-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-heat-chrome absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mitglied, Email, ID, @handle suchen..."
                className="w-full bg-heat-black border border-heat-chrome-dark pl-9 pr-4 py-2 text-white text-xs focus:outline-none focus:border-heat-red rounded-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setOptInFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm ${optInFilter === 'all' ? 'bg-heat-chrome text-black' : 'text-heat-chrome hover:text-white'}`}
              >
                Alle ({members.length})
              </button>
              <button
                onClick={() => setOptInFilter('whatsapp')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm ${optInFilter === 'whatsapp' ? 'bg-green-600 text-white' : 'text-heat-chrome hover:text-white'}`}
              >
                WhatsApp Opt-In
              </button>
              <button
                onClick={() => setOptInFilter('email')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm ${optInFilter === 'email' ? 'bg-heat-red text-white' : 'text-heat-chrome hover:text-white'}`}
              >
                Email Opt-In
              </button>

              <button
                onClick={handleExportCSV}
                className="ml-auto px-4 py-1.5 bg-heat-anthracite border border-heat-chrome-dark text-white text-xs font-bold uppercase tracking-wider hover:border-heat-red flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-heat-chrome-dark rounded-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-heat-anthracite/80 text-heat-chrome uppercase tracking-wider font-bold border-b border-heat-chrome-dark">
                <tr>
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">E-Mail</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Instagram</th>
                  <th className="p-3">Opt-Ins</th>
                  <th className="p-3">Datum</th>
                  <th className="p-3 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heat-chrome-dark/50 bg-heat-black">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-heat-anthracite/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-heat-red">{m.member_number}</td>
                    <td className="p-3 font-bold text-white">{m.first_name} {m.last_name || ''}</td>
                    <td className="p-3 text-zinc-300">{m.email}</td>
                    <td className="p-3 text-zinc-400">{m.phone || '–'}</td>
                    <td className="p-3 text-zinc-400">{m.instagram ? `@${m.instagram}` : '–'}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {m.whatsapp_opt_in && (
                          <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-500/30">
                            WA
                          </span>
                        )}
                        {m.email_marketing_opt_in && (
                          <span className="bg-heat-red/20 text-heat-red text-[10px] font-bold px-1.5 py-0.5 rounded border border-heat-red/30">
                            MAIL
                          </span>
                        )}
                        {!m.whatsapp_opt_in && !m.email_marketing_opt_in && (
                          <span className="text-zinc-600 text-[10px]">KEINE</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-zinc-500">{new Date(m.created_at).toLocaleDateString('de-DE')}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Mitglied löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: CAMPAIGNS */}
      {subTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-bold text-white uppercase">
              HEAT FITS Campaigns
            </h3>
            <button
              onClick={() => {
                setEditingCampaign({
                  title: 'HEAT FITS – ',
                  event_name: 'HEAT Dresden – ',
                  max_votes_per_member: 5,
                  show_vote_count: true,
                  prize: 'TOP FITS WIN 2x GUESTLIST',
                  status: 'live',
                });
                setShowCampaignModal(true);
              }}
              className="px-4 py-2 bg-heat-red text-white text-xs font-bold uppercase tracking-wider hover:bg-heat-wine transition-colors flex items-center gap-1.5 rounded-sm"
            >
              <Plus className="w-4 h-4" /> Neue Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((c) => (
              <div key={c.id} className="bg-heat-anthracite/40 border border-heat-chrome-dark p-6 rounded-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-heat-red font-bold text-xs uppercase tracking-wider block">
                      {c.status.toUpperCase()}
                    </span>
                    <h4 className="font-display text-xl font-bold text-white uppercase mt-0.5">{c.title}</h4>
                    <p className="text-zinc-400 text-xs mt-1">{c.event_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDuplicateCampaign(c.id)}
                      className="p-2 bg-heat-black border border-heat-chrome-dark text-heat-chrome hover:text-white rounded-sm"
                      title="Campaign duplizieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCampaign(c);
                        setShowCampaignModal(true);
                      }}
                      className="p-2 bg-heat-black border border-heat-chrome-dark text-heat-chrome hover:text-white rounded-sm"
                      title="Bearbeiten"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-heat-black/60 p-3 rounded-sm border border-heat-chrome-dark/50">
                  <div>
                    <span className="text-zinc-500 uppercase block font-semibold">Max Votes / Member</span>
                    <span className="text-white font-bold text-sm">{c.max_votes_per_member}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block font-semibold">Vote Counts Öffentlich</span>
                    <span className={`font-bold text-sm ${c.show_vote_count ? 'text-green-400' : 'text-zinc-500'}`}>
                      {c.show_vote_count ? 'AN (Sichtbar)' : 'AUS (Versteckt)'}
                    </span>
                  </div>
                </div>

                {c.prize && (
                  <p className="text-xs text-heat-red font-bold uppercase tracking-wider">
                    Gewinn: {c.prize}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: OUTFIT MODERATION QUEUE */}
      {subTab === 'moderation' && (
        <div className="space-y-6">
          <h3 className="font-display text-lg font-bold text-white uppercase">
            Pending Uploads ({pendingEntries.length})
          </h3>

          {pendingEntries.length === 0 ? (
            <div className="text-center py-16 bg-heat-anthracite/30 border border-heat-chrome-dark p-8 rounded-sm">
              <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-white font-bold uppercase text-sm">Alle Uploads freigeschaltet!</p>
              <p className="text-heat-chrome text-xs mt-1">Keine ausstehenden Outfits in der Moderations-Warteschlange.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingEntries.map((e) => (
                <div key={e.id} className="bg-heat-anthracite/50 border border-heat-chrome-dark rounded-sm overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-[3/4] bg-zinc-950">
                    <img src={e.image_url} alt="Pending Fit" className="w-full h-full object-cover" />
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-white font-bold text-sm">
                        {e.instagram_handle ? `@${e.instagram_handle}` : e.author_name || 'Member'}
                      </p>
                      {e.title && <p className="text-heat-chrome text-xs">{e.title}</p>}
                      {e.caption && <p className="text-zinc-400 text-xs italic mt-1">&quot;{e.caption}&quot;</p>}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-heat-chrome-dark">
                      <button
                        onClick={() => handleModerateEntry(e.id, 'approved')}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs rounded-sm flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> FREIGEBEN
                      </button>
                      <button
                        onClick={() => handleModerateEntry(e.id, 'rejected')}
                        className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold uppercase text-xs rounded-sm"
                        title="Ablehnen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(e.id)}
                        className="px-3 py-2 bg-heat-black border border-heat-chrome-dark text-zinc-400 hover:text-red-400 rounded-sm"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 5: WINNERS & LEADERBOARD */}
      {subTab === 'winners' && (
        <div className="space-y-6">
          <h3 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            HEAT FITS Leaderboard & Gewinner
          </h3>

          <div className="overflow-x-auto border border-heat-chrome-dark rounded-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-heat-anthracite/80 text-heat-chrome uppercase tracking-wider font-bold border-b border-heat-chrome-dark">
                <tr>
                  <th className="p-3">Rang</th>
                  <th className="p-3">Outfit</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Votes</th>
                  <th className="p-3">Badges</th>
                  <th className="p-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heat-chrome-dark/50 bg-heat-black">
                {campaignEntries.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-heat-anthracite/30 transition-colors">
                    <td className="p-3 font-display font-extrabold text-base text-heat-red">#{idx + 1}</td>
                    <td className="p-3">
                      <img src={e.image_url} alt="" className="w-12 h-14 object-cover rounded-sm border border-heat-chrome-dark" />
                    </td>
                    <td className="p-3 font-bold text-white">
                      {e.instagram_handle ? `@${e.instagram_handle}` : e.author_name}
                    </td>
                    <td className="p-3 font-bold text-sm text-amber-400 flex items-center gap-1">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      {e.votes_count || 0}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {e.winners?.map((w: any, i: number) => (
                          <span key={i} className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded">
                            {w.badge_title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedWinnerEntry(e)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider text-[11px] rounded-sm flex items-center gap-1 ml-auto"
                      >
                        <Trophy className="w-3.5 h-3.5" /> WINNER BADGE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAMPAIGN EDIT MODAL */}
      {showCampaignModal && editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-heat-black border border-heat-chrome-dark w-full max-w-lg p-6 rounded-sm space-y-4">
            <h3 className="font-display text-xl font-bold uppercase text-white">Campaign Bearbeiten</h3>
            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-heat-chrome font-bold uppercase mb-1">Titel</label>
                <input
                  type="text"
                  required
                  value={editingCampaign.title || ''}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-2.5 text-white rounded-sm"
                />
              </div>

              <div>
                <label className="block text-heat-chrome font-bold uppercase mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={editingCampaign.event_name || ''}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, event_name: e.target.value })}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-2.5 text-white rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-heat-chrome font-bold uppercase mb-1">Max Votes / Member</label>
                  <input
                    type="number"
                    min={1}
                    value={editingCampaign.max_votes_per_member || 5}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, max_votes_per_member: parseInt(e.target.value) })}
                    className="w-full bg-heat-black border border-heat-chrome-dark p-2.5 text-white rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-heat-chrome font-bold uppercase mb-1">Status</label>
                  <select
                    value={editingCampaign.status || 'live'}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value })}
                    className="w-full bg-heat-black border border-heat-chrome-dark p-2.5 text-white rounded-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="voting_closed">Voting Closed</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="show_vote_count"
                  checked={editingCampaign.show_vote_count !== false}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, show_vote_count: e.target.checked })}
                  className="accent-heat-red"
                />
                <label htmlFor="show_vote_count" className="text-white font-bold">
                  Vote Counts öffentlich in Galerie anzeigen
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-heat-chrome-dark">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 bg-heat-anthracite text-white font-bold uppercase"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-heat-red text-white font-bold uppercase"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WINNER BADGE MODAL */}
      {selectedWinnerEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-heat-black border border-heat-chrome-dark w-full max-w-md p-6 rounded-sm space-y-4">
            <h3 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Winner Badge Vergeben
            </h3>

            <p className="text-xs text-heat-chrome">
              Ausgewähltes Outfit von <strong>{selectedWinnerEntry.author_name}</strong> ({selectedWinnerEntry.votes_count || 0} Votes)
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-heat-chrome font-bold uppercase mb-1">Badge Typ</label>
                <select
                  value={winnerType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setWinnerType(val);
                    if (val === 'community_winner') setBadgeTitle('🏆 COMMUNITY WINNER');
                    if (val === 'heat_choice') setBadgeTitle('🔥 HEAT CHOICE');
                    if (val === 'guestlist_winner') setBadgeTitle('🎟 GUESTLIST WINNER');
                    if (val === 'wildcard') setBadgeTitle('⚡ WILDCARD WINNER');
                  }}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-2.5 text-white rounded-sm"
                >
                  <option value="community_winner">Community Winner</option>
                  <option value="heat_choice">HEAT Choice</option>
                  <option value="guestlist_winner">Guestlist Winner</option>
                  <option value="wildcard">Wildcard</option>
                </select>
              </div>

              <div>
                <label className="block text-heat-chrome font-bold uppercase mb-1">Badge Titel / Text</label>
                <input
                  type="text"
                  value={badgeTitle}
                  onChange={(e) => setBadgeTitle(e.target.value)}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-2.5 text-white rounded-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-heat-chrome-dark">
              <button
                type="button"
                onClick={() => setSelectedWinnerEntry(null)}
                className="px-4 py-2 bg-heat-anthracite text-white font-bold uppercase"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleAssignWinner}
                className="px-5 py-2 bg-amber-500 text-black font-extrabold uppercase"
              >
                Badge Vergeben
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
