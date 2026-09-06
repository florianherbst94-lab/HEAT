'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Upload, Share2, X, Check, Lock, Sparkles, AlertCircle, Heart, Trophy, UserCheck, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface FitCampaignData {
  id: string;
  title: string;
  event_name: string;
  event_date?: string;
  max_votes_per_member: number;
  show_vote_count: boolean;
  prize?: string;
  status: string;
}

interface FitEntryData {
  id: string;
  campaign_id: string;
  image_url: string;
  title?: string;
  caption?: string;
  instagram_handle?: string;
  author_name?: string;
  votes_count?: number;
  has_voted?: boolean;
  created_at: string;
  winners?: { winner_type: string; badge_title: string }[];
}

export default function HeatFitsPage() {
  const t = useTranslations('Fits');

  // State
  const [campaign, setCampaign] = useState<FitCampaignData | null>(null);
  const [entries, setEntries] = useState<FitEntryData[]>([]);
  const [sort, setSort] = useState<'hottest' | 'new'>('hottest');
  const [loading, setLoading] = useState(true);

  // User state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [memberInfo, setMemberInfo] = useState<{ id: string; first_name: string; instagram?: string; whatsapp_opt_in?: boolean } | null>(null);
  const [remainingVotes, setRemainingVotes] = useState(5);
  const [maxVotes, setMaxVotes] = useState(5);

  // Modals
  const [selectedEntry, setSelectedEntry] = useState<FitEntryData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<'vote' | 'upload'>('vote');
  const [pendingVoteEntryId, setPendingVoteEntryId] = useState<string | null>(null);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [whatsAppSubmitted, setWhatsAppSubmitted] = useState(false);

  // Form states - Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadInstagram, setUploadInstagram] = useState('');
  const [websiteConsent, setWebsiteConsent] = useState(false);
  const [socialConsent, setSocialConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form states - Auth
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authInstagram, setAuthInstagram] = useState('');
  const [auth18Plus, setAuth18Plus] = useState(false);
  const [authTerms, setAuthTerms] = useState(false);
  const [authWhatsAppOptIn, setAuthWhatsAppOptIn] = useState(false);
  const [authEmailOptIn, setAuthEmailOptIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data
  useEffect(() => {
    checkUserSession();
    fetchEntries();
  }, [sort]);

  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/community/me');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setMemberInfo(data.member);
        if (data.member.instagram) setUploadInstagram(data.member.instagram);
        if (data.campaign) {
          setRemainingVotes(data.campaign.remaining_votes);
          setMaxVotes(data.campaign.max_votes);
        }
      } else {
        setIsAuthenticated(false);
        setMemberInfo(null);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fits/entries?sort=${sort}`);
      const data = await res.json();
      if (data.campaign) {
        setCampaign(data.campaign);
        if (data.campaign.max_votes_per_member) setMaxVotes(data.campaign.max_votes_per_member);
      }
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Fetch entries error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Vote handler
  const handleVote = async (entryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      setPendingVoteEntryId(entryId);
      setAuthModalReason('vote');
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch('/api/fits/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign?.id,
          entry_id: entryId,
        }),
      });

      const data = await res.json();

      if (res.status === 401 || data.require_auth) {
        setIsAuthenticated(false);
        setPendingVoteEntryId(entryId);
        setAuthModalReason('vote');
        setShowAuthModal(true);
        return;
      }

      if (!res.ok || !data.success) {
        alert(data.error || 'Vote konnte nicht verarbeitet werden.');
        return;
      }

      // Update remaining votes
      setRemainingVotes(data.remaining_votes);

      // Update entry local state
      setEntries((prev) =>
        prev.map((item) => {
          if (item.id === entryId) {
            const newHasVoted = data.has_voted;
            const newCount = newHasVoted ? (item.votes_count || 0) + 1 : Math.max(0, (item.votes_count || 0) - 1);
            return { ...item, has_voted: newHasVoted, votes_count: newCount };
          }
          return item;
        })
      );

      if (selectedEntry && selectedEntry.id === entryId) {
        const newHasVoted = data.has_voted;
        const newCount = newHasVoted
          ? (selectedEntry.votes_count || 0) + 1
          : Math.max(0, (selectedEntry.votes_count || 0) - 1);
        setSelectedEntry({ ...selectedEntry, has_voted: newHasVoted, votes_count: newCount });
      }

      // Show WhatsApp prompt if voted and not opted in yet
      if (data.has_voted && (!memberInfo?.whatsapp_opt_in || !whatsAppSubmitted)) {
        setShowWhatsAppPrompt(true);
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  // Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Das Bild ist zu groß. Maximal 10MB erlaubt.');
        return;
      }
      setUploadFile(file);
      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Bitte wähle ein Bild aus.');
      return;
    }
    if (!websiteConsent) {
      setUploadError('Bitte bestätige die erforderliche Foto-Einwilligung.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('caption', uploadCaption);
    formData.append('instagram_handle', uploadInstagram);
    formData.append('website_consent', String(websiteConsent));
    formData.append('social_media_consent', String(socialConsent));

    try {
      const res = await fetch('/api/fits/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(false);
          setUploadFile(null);
          setUploadPreview(null);
          setUploadTitle('');
          setUploadCaption('');
        }, 2500);
      } else {
        setUploadError(data.error || 'Upload fehlgeschlagen.');
      }
    } catch {
      setUploadError('Verbindungsfehler beim Upload.');
    } finally {
      setUploading(false);
    }
  };

  // Auth Submit handler
  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFirstName || !authEmail) {
      setAuthError('Vorname und E-Mail sind erforderlich.');
      return;
    }
    if (!auth18Plus) {
      setAuthError('Du musst mindestens 18 Jahre alt sein.');
      return;
    }
    if (!authTerms) {
      setAuthError('Bitte stimme den Datenschutzbestimmungen zu.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/community/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: authFirstName,
          last_name: authLastName,
          email: authEmail,
          phone: authPhone,
          instagram: authInstagram,
          is_18_plus: auth18Plus,
          terms_accepted: authTerms,
          whatsapp_opt_in: authWhatsAppOptIn,
          whatsapp_opt_in_source: 'fits_auth_modal',
          email_marketing_opt_in: authEmailOptIn,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setMemberInfo(data.member);
        setShowAuthModal(false);

        // Resume action
        if (authModalReason === 'vote' && pendingVoteEntryId) {
          handleVote(pendingVoteEntryId);
          setPendingVoteEntryId(null);
        } else if (authModalReason === 'upload') {
          setShowUploadModal(true);
        }
      } else {
        setAuthError(data.error || 'Anmeldung fehlgeschlagen.');
      }
    } catch {
      setAuthError('Verbindungsfehler bei der Registrierung.');
    } finally {
      setAuthLoading(false);
    }
  };

  // WhatsApp Lead submit
  const submitWhatsAppLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/community/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: whatsAppPhone,
          source: 'fits_post_vote',
        }),
      });
      setWhatsAppSubmitted(true);
      setTimeout(() => setShowWhatsAppPrompt(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Native share handler
  const handleShare = (entry: FitEntryData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/fits/${entry.id}`;
    const shareData = {
      title: 'HEAT FITS 🔥',
      text: `Vote for ${entry.author_name || 'this'} HEAT FIT 🔥`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link in Zwischenablage kopiert! 🔥');
    }
  };

  return (
    <main className="min-h-screen bg-heat-black text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-heat-red/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-heat-wine/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-heat-red/10 border border-heat-red/30 rounded-full text-heat-red font-bold uppercase tracking-widest text-[11px] mb-4">
              <Flame className="w-3.5 h-3.5 fill-heat-red" />
              HEAT CLUB FASHION CAMPAIGN
            </span>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider uppercase text-white drop-shadow-lg mb-4">
              HEAT FITS
            </h1>
            <p className="font-display text-base sm:text-xl font-bold tracking-widest text-heat-red uppercase mb-4">
              {t('subheadline')}
            </p>
            <p className="text-heat-chrome-light text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
              {t('description')}
            </p>
          </motion.div>

          {/* Active Campaign Info & Counter */}
          {campaign && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 bg-heat-anthracite/60 backdrop-blur-md border border-heat-chrome-dark p-4 md:p-6 rounded-sm shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-left"
            >
              <div>
                <span className="text-heat-chrome text-xs font-bold uppercase tracking-wider block mb-1">
                  Active Campaign
                </span>
                <h3 className="font-display text-lg md:text-xl font-bold text-white uppercase">
                  {campaign.title}
                </h3>
                <p className="text-heat-red text-xs font-semibold mt-0.5">
                  {campaign.event_name} {campaign.prize ? `• ${campaign.prize}` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Vote Counter Badge */}
                <div className="bg-heat-black border border-heat-chrome-dark px-4 py-2 rounded-sm flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${remainingVotes > 0 ? 'text-heat-red fill-heat-red animate-pulse' : 'text-zinc-600'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {remainingVotes > 0 ? (
                      <span className="text-white">
                        <strong className="text-heat-red">{remainingVotes}</strong> / {maxVotes} HEAT VOTES LEFT
                      </span>
                    ) : (
                      <span className="text-zinc-400">ALL VOTES USED 🔥</span>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthModalReason('upload');
                      setShowAuthModal(true);
                    } else {
                      setShowUploadModal(true);
                    }
                  }}
                  className="px-5 py-2.5 bg-heat-red text-white font-bold uppercase tracking-wider text-xs hover:bg-heat-wine transition-all shadow-[0_0_20px_rgba(255,42,42,0.3)] hover:shadow-[0_0_25px_rgba(255,42,42,0.5)] flex items-center gap-2 rounded-sm"
                >
                  <Upload className="w-4 h-4" />
                  {t('upload_btn')}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center mb-8 border-b border-heat-anthracite pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSort('hottest')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm flex items-center gap-1.5 ${
                sort === 'hottest'
                  ? 'bg-heat-red text-white shadow-[0_0_15px_rgba(255,42,42,0.4)]'
                  : 'bg-heat-anthracite/40 text-heat-chrome hover:text-white border border-heat-chrome-dark'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Hottest
            </button>
            <button
              onClick={() => setSort('new')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm flex items-center gap-1.5 ${
                sort === 'new'
                  ? 'bg-heat-red text-white shadow-[0_0_15px_rgba(255,42,42,0.4)]'
                  : 'bg-heat-anthracite/40 text-heat-chrome hover:text-white border border-heat-chrome-dark'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          <span className="text-xs text-heat-chrome font-semibold uppercase tracking-wider hidden sm:inline">
            Showing {entries.length} Looks
          </span>
        </div>

        {/* Gallery Grid (Mobile 2 Columns, Desktop 3-4 Columns) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-heat-anthracite/50 border border-heat-chrome-dark rounded-sm" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-heat-anthracite/30 border border-heat-chrome-dark p-8 rounded-sm">
            <Flame className="w-12 h-12 text-heat-chrome mx-auto mb-4 opacity-50" />
            <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-2">
              No Looks Uploaded Yet
            </h3>
            <p className="text-heat-chrome text-xs mb-6">
              Be the first to bring the HEAT! Upload your fit now.
            </p>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalReason('upload');
                  setShowAuthModal(true);
                } else {
                  setShowUploadModal(true);
                }
              }}
              className="px-6 py-3 bg-heat-red text-white font-bold uppercase tracking-wider text-xs hover:bg-heat-wine transition-all"
            >
              Upload Your Fit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setSelectedEntry(entry)}
                className="group relative bg-heat-anthracite/40 border border-heat-chrome-dark/80 rounded-sm overflow-hidden cursor-pointer hover:border-heat-red/60 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
              >
                {/* Winner Badges Overlay */}
                {entry.winners && entry.winners.length > 0 && (
                  <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {entry.winners.map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg flex items-center gap-1 border border-amber-300"
                      >
                        <Trophy className="w-3 h-3" />
                        {w.badge_title || 'WINNER'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Aspect Ratio Container (Fashion Editorial 3:4) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={entry.image_url}
                    alt={entry.title || 'HEAT FIT'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-heat-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>

                {/* Card Footer Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-xs md:text-sm tracking-wide truncate">
                      {entry.instagram_handle ? `@${entry.instagram_handle}` : entry.author_name || 'Member'}
                    </p>
                    {entry.title && (
                      <p className="text-heat-chrome text-[11px] truncate font-light">
                        {entry.title}
                      </p>
                    )}
                  </div>

                  {/* Vote Button */}
                  <button
                    onClick={(e) => handleVote(entry.id, e)}
                    className={`px-2.5 md:px-3 py-1.5 rounded-sm text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all ${
                      entry.has_voted
                        ? 'bg-heat-red text-white shadow-[0_0_15px_rgba(255,42,42,0.6)]'
                        : 'bg-heat-black/80 hover:bg-heat-red text-white border border-heat-chrome-dark hover:border-heat-red'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${entry.has_voted ? 'fill-white' : 'text-heat-red'}`} />
                    {campaign?.show_vote_count !== false && (
                      <span className="text-xs">{entry.votes_count || 0}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntry(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-heat-black border border-heat-chrome-dark w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm relative grid grid-cols-1 md:grid-cols-2 shadow-[0_0_60px_rgba(0,0,0,0.9)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 z-30 bg-heat-black/80 text-white p-2 rounded-full border border-heat-chrome-dark hover:border-heat-red transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image */}
              <div className="relative aspect-[3/4] bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedEntry.image_url}
                  alt={selectedEntry.title || 'HEAT FIT'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Modal Details Side */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  {selectedEntry.winners && selectedEntry.winners.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selectedEntry.winners.map((w, idx) => (
                        <span key={idx} className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded border border-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Trophy className="w-4 h-4" />
                          {w.badge_title}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-heat-red text-xs font-bold uppercase tracking-widest block mb-1">
                    HEAT MEMBER LOOK
                  </span>
                  <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
                    {selectedEntry.instagram_handle ? `@${selectedEntry.instagram_handle}` : selectedEntry.author_name}
                  </h2>

                  {selectedEntry.title && (
                    <p className="text-heat-chrome-light text-sm font-semibold mt-2">
                      {selectedEntry.title}
                    </p>
                  )}

                  {selectedEntry.caption && (
                    <p className="text-zinc-400 text-sm font-light mt-3 leading-relaxed border-l-2 border-heat-red pl-3 py-1">
                      &quot;{selectedEntry.caption}&quot;
                    </p>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-6 border-t border-heat-anthracite space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-heat-chrome text-xs font-bold uppercase tracking-wider block">
                        VOTES RECEIVED
                      </span>
                      <span className="text-2xl font-display font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                        <Flame className="w-6 h-6 text-heat-red fill-heat-red" />
                        {selectedEntry.votes_count || 0}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleVote(selectedEntry.id, e)}
                      className={`px-6 py-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all rounded-sm ${
                        selectedEntry.has_voted
                          ? 'bg-heat-red text-white shadow-[0_0_20px_rgba(255,42,42,0.6)]'
                          : 'bg-white text-black hover:bg-heat-red hover:text-white'
                      }`}
                    >
                      <Flame className={`w-4 h-4 ${selectedEntry.has_voted ? 'fill-white' : ''}`} />
                      {selectedEntry.has_voted ? 'VOTED 🔥' : 'VOTE FOR FIT'}
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleShare(selectedEntry, e)}
                    className="w-full py-3 bg-heat-anthracite/60 border border-heat-chrome-dark text-heat-chrome hover:text-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 rounded-sm"
                  >
                    <Share2 className="w-4 h-4 text-heat-red" />
                    SHARE FIT
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-heat-black border border-heat-chrome-dark w-full max-w-lg p-6 md:p-8 rounded-sm relative max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-heat-chrome hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-1 block">
                  SHOW US YOUR STYLE
                </span>
                <h2 className="font-display text-2xl font-bold tracking-wider text-white uppercase">
                  UPLOAD YOUR HEAT FIT
                </h2>
              </div>

              {uploadSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 text-green-400 border border-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    FIT SUBMITTED! 🔥
                  </h3>
                  <p className="text-heat-chrome text-xs max-w-xs mx-auto">
                    Dein Outfit wurde erfolgreich hochgeladen und befindet sich in der Moderation. Nach Freigabe erscheint es in der Galerie!
                  </p>
                </div>
              ) : (
                <form onSubmit={submitUpload} className="space-y-5">
                  {/* File Selector */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block">
                      Outfit Foto *
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-heat-chrome-dark hover:border-heat-red p-6 text-center rounded-sm cursor-pointer transition-colors bg-heat-anthracite/30 relative aspect-[4/3] flex flex-col items-center justify-center"
                    >
                      {uploadPreview ? (
                        <img src={uploadPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-sm" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-heat-chrome mb-2" />
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            Foto auswählen
                          </span>
                          <span className="text-[10px] text-heat-chrome-dark mt-1">
                            JPG, PNG, WebP (Max. 10MB)
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Title & Caption */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Titel (Optional)
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="z.B. Cyber Chrome Night"
                        className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Instagram Username (Optional)
                      </label>
                      <input
                        type="text"
                        value={uploadInstagram}
                        onChange={(e) => setUploadInstagram(e.target.value)}
                        placeholder="@deinhandle"
                        className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                        Beschreibung / Caption (Optional)
                      </label>
                      <textarea
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="Kurze Beschreibung deines Fits..."
                        rows={2}
                        className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                      />
                    </div>
                  </div>

                  {/* Consents */}
                  <div className="space-y-3 pt-2 border-t border-heat-anthracite text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteConsent}
                        onChange={(e) => setWebsiteConsent(e.target.checked)}
                        className="mt-0.5 accent-heat-red"
                        required
                      />
                      <span className="text-heat-chrome-light leading-snug">
                        Ich bestätige, dass ich berechtigt bin, dieses Foto hochzuladen und abgebildete Personen einverstanden sind. HEAT darf das Foto auf der Website darstellen. *
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={socialConsent}
                        onChange={(e) => setSocialConsent(e.target.checked)}
                        className="mt-0.5 accent-heat-red"
                      />
                      <span className="text-heat-chrome-light leading-snug">
                        HEAT darf mein Foto für Social-Media-Kommunikation rund um HEAT verwenden (Optional).
                      </span>
                    </label>
                  </div>

                  {uploadError && (
                    <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-sm text-center">
                      <p className="text-red-400 text-xs font-semibold">{uploadError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3.5 bg-heat-red text-white font-bold uppercase tracking-widest text-xs hover:bg-heat-wine transition-all rounded-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,42,42,0.3)]"
                  >
                    {uploading ? 'Wird hochgeladen...' : 'OUTFIT SUBMITTEN 🔥'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTHENTICATION / REGISTRATION MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-heat-black border border-heat-chrome-dark w-full max-w-md p-6 md:p-8 rounded-sm relative max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-heat-chrome hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-1 block">
                  EXCLUSIVE MEMBER ACCESS
                </span>
                <h2 className="font-display text-2xl font-bold tracking-wider text-white uppercase">
                  JOIN THE HEAT CLUB
                </h2>
                <p className="text-heat-chrome text-xs mt-1">
                  Registriere dich in Sekunden, um abzustimmen & Perks zu sichern.
                </p>
              </div>

              <form onSubmit={submitAuth} className="space-y-4 text-left">
                <div>
                  <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    required
                    value={authFirstName}
                    onChange={(e) => setAuthFirstName(e.target.value)}
                    placeholder="Dein Vorname"
                    className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                    E-Mail Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="dein@email.com"
                    className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                      Instagram (Optional)
                    </label>
                    <input
                      type="text"
                      value={authInstagram}
                      onChange={(e) => setAuthInstagram(e.target.value)}
                      placeholder="@handle"
                      className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold block mb-1">
                      WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+49..."
                      className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2.5 text-white text-sm focus:outline-none focus:border-heat-red rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-heat-anthracite text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auth18Plus}
                      onChange={(e) => setAuth18Plus(e.target.checked)}
                      className="accent-heat-red"
                      required
                    />
                    <span className="text-white font-bold">Ich bin 18+ Jahre alt *</span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authTerms}
                      onChange={(e) => setAuthTerms(e.target.checked)}
                      className="mt-0.5 accent-heat-red"
                      required
                    />
                    <span className="text-heat-chrome-light">
                      Ich stimme den Datenschutzbestimmungen und den HEAT CLUB Bedingungen zu. *
                    </span>
                  </label>

                  <div className="pt-2 border-t border-heat-anthracite/60 space-y-2">
                    <span className="text-[11px] font-bold text-heat-chrome uppercase tracking-wider block">
                      Freiwillige Updates (Kein Vorausgewähltes Häkchen)
                    </span>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={authWhatsAppOptIn}
                        onChange={(e) => setAuthWhatsAppOptIn(e.target.checked)}
                        className="mt-0.5 accent-heat-red"
                      />
                      <span className="text-heat-chrome-light">
                        Ich möchte HEAT Updates, Guestlist Drops & News per WhatsApp erhalten.
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={authEmailOptIn}
                        onChange={(e) => setAuthEmailOptIn(e.target.checked)}
                        className="mt-0.5 accent-heat-red"
                      />
                      <span className="text-heat-chrome-light">
                        Ich möchte HEAT Updates per E-Mail erhalten.
                      </span>
                    </label>
                  </div>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-sm text-center">
                    <p className="text-red-400 text-xs font-semibold">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-heat-red text-white font-bold uppercase tracking-widest text-xs hover:bg-heat-wine transition-all rounded-sm disabled:opacity-50 shadow-[0_0_20px_rgba(255,42,42,0.3)]"
                >
                  {authLoading ? 'Registriere...' : 'CLUB BEITRETEN & VOTEN 🔥'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WHATSAPP LEAD PROMPT MODAL */}
      <AnimatePresence>
        {showWhatsAppPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-heat-black border border-heat-red p-6 max-w-sm rounded-sm shadow-[0_0_40px_rgba(255,42,42,0.4)]"
          >
            <button
              onClick={() => setShowWhatsAppPrompt(false)}
              className="absolute top-2 right-2 text-heat-chrome hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-heat-red font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-heat-red" />
              VOTE SUBMITTED! 🔥
            </div>

            <h4 className="font-display font-bold text-white text-base uppercase mb-2">
              WANT GUESTLIST DROPS FIRST?
            </h4>
            <p className="text-heat-chrome text-xs mb-4">
              Erhalte exklusive Secret Releases, VIP Access & Event News direkt auf dein Handy per WhatsApp.
            </p>

            {whatsAppSubmitted ? (
              <div className="text-green-400 text-xs font-bold text-center py-2 bg-green-500/10 border border-green-500/30 rounded-sm">
                ERFOLGREICH ZUM WHATSAPP CLUB HINZUGEFÜGT! 📲
              </div>
            ) : (
              <form onSubmit={submitWhatsAppLead} className="space-y-3">
                <input
                  type="tel"
                  required
                  value={whatsAppPhone}
                  onChange={(e) => setWhatsAppPhone(e.target.value)}
                  placeholder="Mobilnummer (+49...)"
                  className="w-full bg-heat-black border border-heat-chrome-dark px-3 py-2 text-white text-xs focus:outline-none focus:border-heat-red rounded-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-xs transition-colors rounded-sm flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  JOIN HEAT ON WHATSAPP
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
