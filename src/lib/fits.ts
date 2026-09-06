import { supabaseAdmin } from './supabase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getMemberBySessionToken, HeatMember } from './community';

export interface FitCampaign {
  id: string;
  title: string;
  slug: string;
  event_name: string;
  event_date?: string;
  upload_start?: string;
  upload_end?: string;
  voting_start?: string;
  voting_end?: string;
  max_votes_per_member: number;
  show_vote_count: boolean;
  description?: string;
  prize?: string;
  hero_image_url?: string;
  status: 'draft' | 'upcoming' | 'live' | 'voting_closed' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface FitEntry {
  id: string;
  campaign_id: string;
  member_id: string;
  image_url: string;
  title?: string;
  caption?: string;
  instagram_handle?: string;
  author_name?: string;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'hidden';
  website_consent: boolean;
  social_media_consent: boolean;
  created_at: string;
  approved_at?: string;
  votes_count?: number;
  has_voted?: boolean;
  winners?: FitWinner[];
}

export interface FitVote {
  id: string;
  campaign_id: string;
  entry_id: string;
  member_id: string;
  created_at: string;
}

export interface FitWinner {
  id: string;
  campaign_id: string;
  entry_id: string;
  winner_type: 'community_winner' | 'heat_choice' | 'wildcard' | 'guestlist_winner';
  badge_title: string;
  created_at: string;
}

// Fallback in-memory stores to ensure instant availability and testability
const fallbackCampaigns: Map<string, FitCampaign> = new Map();
const fallbackEntries: Map<string, FitEntry> = new Map();
const fallbackVotes: FitVote[] = [];
const fallbackWinners: Map<string, FitWinner> = new Map();

// Helper to seed initial demo campaign "HEAT FITS – TEST EDITION"
function ensureDemoCampaign() {
  if (fallbackCampaigns.size === 0) {
    const demoId = 'demo-campaign-001';
    const demoCampaign: FitCampaign = {
      id: demoId,
      title: 'HEAT FITS – September Edition',
      slug: 'september-edition',
      event_name: 'HEAT Dresden – 26.09.2026',
      event_date: '2026-09-26',
      upload_start: '2026-09-01T00:00:00Z',
      upload_end: '2026-09-25T23:59:59Z',
      voting_start: '2026-09-01T00:00:00Z',
      voting_end: '2026-09-26T18:00:00Z',
      max_votes_per_member: 5,
      show_vote_count: true,
      description: 'Dress up. Show up. Bring the HEAT. Upload your look and vote for the hottest styles of Dresden nightlife.',
      prize: 'TOP FITS WIN 2x GUESTLIST + VIP ACCESS',
      status: 'live',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackCampaigns.set(demoId, demoCampaign);

    // Initial demo entries
    const demoEntries: FitEntry[] = [
      {
        id: 'demo-entry-1',
        campaign_id: demoId,
        member_id: 'demo-member-1',
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        title: 'Cyber Chrome Night',
        caption: 'Leather x Silver chain combo for the next HEAT bash 🔥',
        instagram_handle: 'maya.streetwear',
        author_name: 'Maya',
        moderation_status: 'approved',
        website_consent: true,
        social_media_consent: true,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        votes_count: 14,
      },
      {
        id: 'demo-entry-2',
        campaign_id: demoId,
        member_id: 'demo-member-2',
        image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
        title: 'Dark Fashion Vibe',
        caption: 'All black oversized silhouette.',
        instagram_handle: 'leon.fit',
        author_name: 'Leon',
        moderation_status: 'approved',
        website_consent: true,
        social_media_consent: true,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        votes_count: 23,
      },
      {
        id: 'demo-entry-3',
        campaign_id: demoId,
        member_id: 'demo-member-3',
        image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        title: 'Nightlife Energy',
        caption: 'Bringing that raw HEAT energy.',
        instagram_handle: 'sophia.vibe',
        author_name: 'Sophia',
        moderation_status: 'approved',
        website_consent: true,
        social_media_consent: false,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        votes_count: 9,
      },
      {
        id: 'demo-entry-4',
        campaign_id: demoId,
        member_id: 'demo-member-4',
        image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
        title: 'Amapiano Heat',
        caption: 'Ready for the bass drop!',
        instagram_handle: 'sam_dresden',
        author_name: 'Sam',
        moderation_status: 'approved',
        website_consent: true,
        social_media_consent: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        votes_count: 18,
      },
    ];

    demoEntries.forEach((e) => fallbackEntries.set(e.id, e));
  }
}

ensureDemoCampaign();

export async function getActiveCampaign(): Promise<FitCampaign | null> {
  ensureDemoCampaign();
  try {
    const { data } = await supabaseAdmin
      .from('fit_campaigns')
      .select('*')
      .in('status', ['live', 'voting_closed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) return data as FitCampaign;
  } catch (err) {
    console.warn('Supabase campaign query failed:', err);
  }

  const live = Array.from(fallbackCampaigns.values()).find(c => c.status === 'live' || c.status === 'voting_closed');
  return live || Array.from(fallbackCampaigns.values())[0] || null;
}

export async function getAllCampaigns(): Promise<FitCampaign[]> {
  ensureDemoCampaign();
  try {
    const { data } = await supabaseAdmin
      .from('fit_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) return data as FitCampaign[];
  } catch (err) {
    console.warn('Supabase get all campaigns failed:', err);
  }

  return Array.from(fallbackCampaigns.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function createOrUpdateCampaign(payload: Partial<FitCampaign>): Promise<FitCampaign> {
  ensureDemoCampaign();
  const id = payload.id || uuidv4();
  const now = new Date().toISOString();
  const campaignData: FitCampaign = {
    id,
    title: payload.title || 'New Fit Campaign',
    slug: payload.slug || `campaign-${Date.now()}`,
    event_name: payload.event_name || 'HEAT Dresden Event',
    event_date: payload.event_date || now.split('T')[0],
    upload_start: payload.upload_start || now,
    upload_end: payload.upload_end || now,
    voting_start: payload.voting_start || now,
    voting_end: payload.voting_end || now,
    max_votes_per_member: payload.max_votes_per_member !== undefined ? payload.max_votes_per_member : 5,
    show_vote_count: payload.show_vote_count !== undefined ? payload.show_vote_count : true,
    description: payload.description || '',
    prize: payload.prize || '2x Guestlist',
    hero_image_url: payload.hero_image_url || '',
    status: payload.status || 'live',
    created_at: payload.created_at || now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('fit_campaigns')
      .upsert(campaignData)
      .select()
      .single();

    if (!error && data) {
      fallbackCampaigns.set(data.id, data as FitCampaign);
      return data as FitCampaign;
    }
  } catch (err) {
    console.warn('Supabase save campaign failed:', err);
  }

  fallbackCampaigns.set(id, campaignData);
  return campaignData;
}

export async function duplicateCampaign(campaignId: string): Promise<FitCampaign | null> {
  const existing = Array.from(fallbackCampaigns.values()).find(c => c.id === campaignId);
  if (!existing) return null;

  const newCampaign: FitCampaign = {
    ...existing,
    id: uuidv4(),
    title: `${existing.title} (Copy)`,
    slug: `${existing.slug}-copy-${Date.now()}`,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return createOrUpdateCampaign(newCampaign);
}

export async function getCampaignEntries(
  campaignId: string,
  sort: 'hottest' | 'new' = 'hottest',
  memberId?: string
): Promise<FitEntry[]> {
  ensureDemoCampaign();

  let entries: FitEntry[] = [];
  try {
    const { data: dbEntries } = await supabaseAdmin
      .from('fit_entries')
      .select(`
        *,
        heat_members(first_name, instagram)
      `)
      .eq('campaign_id', campaignId)
      .eq('moderation_status', 'approved');

    if (dbEntries && dbEntries.length > 0) {
      entries = dbEntries.map((e: any) => ({
        ...e,
        author_name: e.heat_members?.first_name || 'Member',
        instagram_handle: e.instagram_handle || e.heat_members?.instagram || '',
      }));
    }
  } catch (err) {
    console.warn('Supabase entries query failed:', err);
  }

  if (entries.length === 0) {
    entries = Array.from(fallbackEntries.values()).filter(
      e => e.campaign_id === campaignId && e.moderation_status === 'approved'
    );
  }

  // Attach vote counts & user voted status
  const votesMap: Record<string, number> = {};
  const userVotedEntryIds = new Set<string>();

  // Fetch votes from Supabase
  try {
    const { data: dbVotes } = await supabaseAdmin
      .from('fit_votes')
      .select('*')
      .eq('campaign_id', campaignId);

    if (dbVotes) {
      dbVotes.forEach((v: any) => {
        votesMap[v.entry_id] = (votesMap[v.entry_id] || 0) + 1;
        if (memberId && v.member_id === memberId) {
          userVotedEntryIds.add(v.entry_id);
        }
      });
    }
  } catch (err) {
    console.warn('Supabase votes query failed:', err);
  }

  // Fallback votes merge
  fallbackVotes.forEach(v => {
    if (v.campaign_id === campaignId) {
      votesMap[v.entry_id] = (votesMap[v.entry_id] || 0) + 1;
      if (memberId && v.member_id === memberId) {
        userVotedEntryIds.add(v.entry_id);
      }
    }
  });

  // Attach winners badges
  const winnersList = Array.from(fallbackWinners.values()).filter(w => w.campaign_id === campaignId);

  entries = entries.map(e => ({
    ...e,
    votes_count: (e.votes_count || 0) + (votesMap[e.id] || 0),
    has_voted: userVotedEntryIds.has(e.id),
    winners: winnersList.filter(w => w.entry_id === e.id),
  }));

  // Sort
  if (sort === 'hottest') {
    entries.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
  } else {
    entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return entries;
}

export async function createFitEntry(payload: {
  campaign_id: string;
  member_id: string;
  image_url: string;
  title?: string;
  caption?: string;
  instagram_handle?: string;
  website_consent: boolean;
  social_media_consent?: boolean;
  author_name?: string;
}): Promise<FitEntry> {
  ensureDemoCampaign();
  const id = uuidv4();
  const now = new Date().toISOString();

  const entry: FitEntry = {
    id,
    campaign_id: payload.campaign_id,
    member_id: payload.member_id,
    image_url: payload.image_url,
    title: payload.title || '',
    caption: payload.caption || '',
    instagram_handle: payload.instagram_handle ? payload.instagram_handle.replace(/^@/, '') : '',
    author_name: payload.author_name || 'HEAT Member',
    moderation_status: 'pending', // Pending approval by default
    website_consent: payload.website_consent,
    social_media_consent: !!payload.social_media_consent,
    created_at: now,
    votes_count: 0,
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('fit_entries')
      .insert([{
        id: entry.id,
        campaign_id: entry.campaign_id,
        member_id: entry.member_id,
        image_url: entry.image_url,
        title: entry.title,
        caption: entry.caption,
        instagram_handle: entry.instagram_handle,
        moderation_status: 'pending',
        website_consent: entry.website_consent,
        social_media_consent: entry.social_media_consent,
        created_at: now,
      }])
      .select()
      .single();

    if (!error && data) {
      fallbackEntries.set(data.id, entry);
      return entry;
    }
  } catch (err) {
    console.warn('Supabase fit entry insert failed:', err);
  }

  fallbackEntries.set(id, entry);
  return entry;
}

export async function toggleVote(
  campaignId: string,
  entryId: string,
  memberId: string
): Promise<{ success: boolean; has_voted: boolean; remaining_votes: number; error?: string }> {
  ensureDemoCampaign();

  const campaign = Array.from(fallbackCampaigns.values()).find(c => c.id === campaignId) || await getActiveCampaign();
  const maxVotes = campaign?.max_votes_per_member ?? 5;

  // Check how many votes member has already cast in this campaign
  let memberVotesInCampaign = fallbackVotes.filter(v => v.campaign_id === campaignId && v.member_id === memberId);

  // Check if member already voted for this entry
  const existingVoteIndex = fallbackVotes.findIndex(
    v => v.campaign_id === campaignId && v.entry_id === entryId && v.member_id === memberId
  );

  if (existingVoteIndex >= 0) {
    // Retract vote
    fallbackVotes.splice(existingVoteIndex, 1);
    try {
      await supabaseAdmin
        .from('fit_votes')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('entry_id', entryId)
        .eq('member_id', memberId);
    } catch (err) {
      console.warn('Supabase delete vote error:', err);
    }

    const remaining = Math.max(0, maxVotes - (memberVotesInCampaign.length - 1));
    return { success: true, has_voted: false, remaining_votes: remaining };
  }

  // Check limit before adding new vote
  if (memberVotesInCampaign.length >= maxVotes) {
    return {
      success: false,
      has_voted: false,
      remaining_votes: 0,
      error: `You have reached your limit of ${maxVotes} HEAT votes for this edition.`,
    };
  }

  // Add new vote
  const newVote: FitVote = {
    id: uuidv4(),
    campaign_id: campaignId,
    entry_id: entryId,
    member_id: memberId,
    created_at: new Date().toISOString(),
  };

  fallbackVotes.push(newVote);

  try {
    await supabaseAdmin
      .from('fit_votes')
      .insert([newVote]);
  } catch (err) {
    console.warn('Supabase insert vote error:', err);
  }

  const remaining = Math.max(0, maxVotes - (memberVotesInCampaign.length + 1));
  return { success: true, has_voted: true, remaining_votes: remaining };
}

export async function getMemberVotesCount(campaignId: string, memberId: string): Promise<number> {
  ensureDemoCampaign();
  const v = fallbackVotes.filter(x => x.campaign_id === campaignId && x.member_id === memberId);
  return v.length;
}

export async function getPendingEntries(): Promise<FitEntry[]> {
  ensureDemoCampaign();
  return Array.from(fallbackEntries.values()).filter(e => e.moderation_status === 'pending');
}

export async function updateEntryStatus(
  entryId: string,
  status: 'approved' | 'rejected' | 'hidden'
): Promise<boolean> {
  ensureDemoCampaign();
  const now = new Date().toISOString();
  const entry = fallbackEntries.get(entryId);
  if (entry) {
    entry.moderation_status = status;
    if (status === 'approved') entry.approved_at = now;
  }

  try {
    await supabaseAdmin
      .from('fit_entries')
      .update({ moderation_status: status, approved_at: status === 'approved' ? now : null })
      .eq('id', entryId);
  } catch (err) {
    console.warn('Supabase update status failed:', err);
  }

  return true;
}

export async function deleteEntry(entryId: string): Promise<boolean> {
  ensureDemoCampaign();
  fallbackEntries.delete(entryId);
  try {
    await supabaseAdmin.from('fit_entries').delete().eq('id', entryId);
  } catch (err) {
    console.warn('Supabase delete entry failed:', err);
  }
  return true;
}

export async function assignWinnerBadge(
  campaignId: string,
  entryId: string,
  winnerType: 'community_winner' | 'heat_choice' | 'wildcard' | 'guestlist_winner',
  badgeTitle: string
): Promise<FitWinner> {
  ensureDemoCampaign();
  const winner: FitWinner = {
    id: uuidv4(),
    campaign_id: campaignId,
    entry_id: entryId,
    winner_type: winnerType,
    badge_title: badgeTitle,
    created_at: new Date().toISOString(),
  };

  fallbackWinners.set(winner.id, winner);

  try {
    await supabaseAdmin.from('fit_winners').insert([winner]);
  } catch (err) {
    console.warn('Supabase insert winner error:', err);
  }

  return winner;
}

export async function removeWinnerBadge(winnerId: string): Promise<boolean> {
  ensureDemoCampaign();
  fallbackWinners.delete(winnerId);
  try {
    await supabaseAdmin.from('fit_winners').delete().eq('id', winnerId);
  } catch (err) {
    console.warn('Supabase delete winner error:', err);
  }
  return true;
}
