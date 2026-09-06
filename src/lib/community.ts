import { supabaseAdmin } from './supabase-admin';
import { v4 as uuidv4 } from 'uuid';

export interface HeatMember {
  id: string;
  member_number: string;
  member_seq: number;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  instagram?: string;
  birthdate?: string;
  email_verified_at?: string;
  whatsapp_opt_in: boolean;
  whatsapp_opt_in_at?: string;
  whatsapp_opt_in_source?: string;
  email_marketing_opt_in: boolean;
  email_marketing_opt_in_at?: string;
  consent_terms_text?: string;
  session_token?: string;
  auth_otp?: string;
  auth_otp_expires_at?: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
}

const fallbackMembers: Map<string, HeatMember> = new Map();
let fallbackSequence = 1842;

// Seed default test member
const demoTestMember: HeatMember = {
  id: 'demo-test-member-001',
  member_seq: 1842,
  member_number: 'HEAT #001842',
  first_name: 'Max',
  last_name: 'Mustermann',
  email: 'test@heatdresden.de',
  phone: '+491701234567',
  instagram: 'max.streetwear',
  birthdate: '1998-05-15',
  email_verified_at: new Date().toISOString(),
  whatsapp_opt_in: true,
  whatsapp_opt_in_at: new Date().toISOString(),
  whatsapp_opt_in_source: 'demo_seed',
  email_marketing_opt_in: true,
  email_marketing_opt_in_at: new Date().toISOString(),
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  session_token: 'demo-test-session-token',
};
fallbackMembers.set(demoTestMember.id, demoTestMember);

export function formatMemberNumber(seq: number): string {
  return `HEAT #${String(seq).padStart(6, '0')}`;
}

export async function createOrUpdateMember(payload: {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  instagram?: string;
  birthdate?: string;
  is_18_plus?: boolean;
  whatsapp_opt_in?: boolean;
  whatsapp_opt_in_source?: string;
  email_marketing_opt_in?: boolean;
  terms_accepted?: boolean;
}): Promise<HeatMember> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  // Try fetching existing member by email from Supabase
  try {
    const { data: existing } = await supabaseAdmin
      .from('heat_members')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      // Update existing member record
      const updateData: Partial<HeatMember> = {
        first_name: payload.first_name || existing.first_name,
        last_name: payload.last_name !== undefined ? payload.last_name : existing.last_name,
        phone: payload.phone !== undefined ? payload.phone : existing.phone,
        instagram: payload.instagram !== undefined ? payload.instagram : existing.instagram,
        birthdate: payload.birthdate !== undefined ? payload.birthdate : existing.birthdate,
        updated_at: now,
      };

      if (payload.whatsapp_opt_in) {
        updateData.whatsapp_opt_in = true;
        updateData.whatsapp_opt_in_at = now;
        updateData.whatsapp_opt_in_source = payload.whatsapp_opt_in_source || existing.whatsapp_opt_in_source || 'community_signup';
      }

      if (payload.email_marketing_opt_in) {
        updateData.email_marketing_opt_in = true;
        updateData.email_marketing_opt_in_at = now;
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('heat_members')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (!updateErr && updated) {
        fallbackMembers.set(updated.id, updated as HeatMember);
        return updated as HeatMember;
      }
    }
  } catch (err) {
    console.warn('Supabase query failed, using fallback memory state', err);
  }

  // Check fallback memory for existing
  for (const m of fallbackMembers.values()) {
    if (m.email.toLowerCase() === normalizedEmail) {
      if (payload.first_name) m.first_name = payload.first_name;
      if (payload.last_name !== undefined) m.last_name = payload.last_name;
      if (payload.phone !== undefined) m.phone = payload.phone;
      if (payload.instagram !== undefined) m.instagram = payload.instagram;
      if (payload.whatsapp_opt_in) {
        m.whatsapp_opt_in = true;
        m.whatsapp_opt_in_at = now;
        m.whatsapp_opt_in_source = payload.whatsapp_opt_in_source || m.whatsapp_opt_in_source || 'community_signup';
      }
      if (payload.email_marketing_opt_in) {
        m.email_marketing_opt_in = true;
        m.email_marketing_opt_in_at = now;
      }
      m.updated_at = now;
      return m;
    }
  }

  // Create new member in Supabase
  const sessionToken = uuidv4();
  const insertData = {
    first_name: payload.first_name,
    last_name: payload.last_name || null,
    email: normalizedEmail,
    phone: payload.phone || null,
    instagram: payload.instagram ? payload.instagram.replace(/^@/, '') : null,
    birthdate: payload.birthdate || null,
    email_verified_at: now, // Auto-verified for seamless UX
    whatsapp_opt_in: !!payload.whatsapp_opt_in,
    whatsapp_opt_in_at: payload.whatsapp_opt_in ? now : null,
    whatsapp_opt_in_source: payload.whatsapp_opt_in ? (payload.whatsapp_opt_in_source || 'community_signup') : null,
    email_marketing_opt_in: !!payload.email_marketing_opt_in,
    email_marketing_opt_in_at: payload.email_marketing_opt_in ? now : null,
    consent_terms_text: 'HEAT Club Terms & Privacy Policy (Accepted upon registration)',
    session_token: sessionToken,
    status: 'active',
    created_at: now,
    updated_at: now,
  };

  try {
    const { data: created, error: createErr } = await supabaseAdmin
      .from('heat_members')
      .insert([insertData])
      .select()
      .single();

    if (!createErr && created) {
      fallbackMembers.set(created.id, created as HeatMember);
      return created as HeatMember;
    }
    if (createErr) console.warn('Supabase member insert warning:', createErr.message);
  } catch (err) {
    console.warn('Supabase member insert exception:', err);
  }

  // Fallback member creation if DB table missing
  fallbackSequence += 1;
  const newSeq = fallbackSequence;
  const memberId = uuidv4();
  const fallbackMember: HeatMember = {
    id: memberId,
    member_seq: newSeq,
    member_number: formatMemberNumber(newSeq),
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: normalizedEmail,
    phone: payload.phone,
    instagram: payload.instagram ? payload.instagram.replace(/^@/, '') : undefined,
    birthdate: payload.birthdate,
    email_verified_at: now,
    whatsapp_opt_in: !!payload.whatsapp_opt_in,
    whatsapp_opt_in_at: payload.whatsapp_opt_in ? now : undefined,
    whatsapp_opt_in_source: payload.whatsapp_opt_in ? (payload.whatsapp_opt_in_source || 'community_signup') : undefined,
    email_marketing_opt_in: !!payload.email_marketing_opt_in,
    email_marketing_opt_in_at: payload.email_marketing_opt_in ? now : undefined,
    consent_terms_text: 'HEAT Club Terms & Privacy Policy (Accepted upon registration)',
    session_token: sessionToken,
    status: 'active',
    created_at: now,
    updated_at: now,
  };

  fallbackMembers.set(memberId, fallbackMember);
  return fallbackMember;
}

export async function getMemberBySessionToken(token: string): Promise<HeatMember | null> {
  if (!token) return null;

  try {
    const { data } = await supabaseAdmin
      .from('heat_members')
      .select('*')
      .eq('session_token', token)
      .single();

    if (data) return data as HeatMember;
  } catch (err) {
    console.warn('Supabase token query failed:', err);
  }

  for (const m of fallbackMembers.values()) {
    if (m.session_token === token) return m;
  }

  return null;
}

export async function getAllMembers(): Promise<HeatMember[]> {
  try {
    const { data } = await supabaseAdmin
      .from('heat_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) return data as HeatMember[];
  } catch (err) {
    console.warn('Supabase get all members failed:', err);
  }

  return Array.from(fallbackMembers.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteMember(id: string): Promise<boolean> {
  try {
    await supabaseAdmin.from('heat_members').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete member failed:', err);
  }
  fallbackMembers.delete(id);
  return true;
}

export async function updateWhatsAppOptIn(
  memberId: string,
  phone?: string,
  source: string = 'heat_fits_vote'
): Promise<HeatMember | null> {
  const now = new Date().toISOString();
  const updatePayload: any = {
    whatsapp_opt_in: true,
    whatsapp_opt_in_at: now,
    whatsapp_opt_in_source: source,
  };
  if (phone) updatePayload.phone = phone;

  try {
    const { data, error } = await supabaseAdmin
      .from('heat_members')
      .update(updatePayload)
      .eq('id', memberId)
      .select()
      .single();

    if (!error && data) {
      fallbackMembers.set(data.id, data as HeatMember);
      return data as HeatMember;
    }
  } catch (err) {
    console.warn('Supabase update WhatsApp opt-in failed:', err);
  }

  const mem = fallbackMembers.get(memberId);
  if (mem) {
    mem.whatsapp_opt_in = true;
    mem.whatsapp_opt_in_at = now;
    mem.whatsapp_opt_in_source = source;
    if (phone) mem.phone = phone;
    return mem;
  }

  return null;
}

export async function loginMemberByEmail(email: string): Promise<HeatMember | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const sessionToken = uuidv4();
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabaseAdmin
      .from('heat_members')
      .update({ session_token: sessionToken, updated_at: now })
      .eq('email', normalizedEmail)
      .select()
      .single();

    if (!error && data) {
      fallbackMembers.set(data.id, data as HeatMember);
      return data as HeatMember;
    }
  } catch (err) {
    console.warn('Supabase login by email failed:', err);
  }

  for (const m of fallbackMembers.values()) {
    if (m.email.toLowerCase() === normalizedEmail) {
      m.session_token = sessionToken;
      m.updated_at = now;
      return m;
    }
  }

  return null;
}

export async function updateMemberProfile(
  memberId: string,
  payload: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    instagram?: string;
    whatsapp_opt_in?: boolean;
    email_marketing_opt_in?: boolean;
  }
): Promise<HeatMember | null> {
  const now = new Date().toISOString();
  const updateData: any = { updated_at: now };

  if (payload.first_name !== undefined) updateData.first_name = payload.first_name;
  if (payload.last_name !== undefined) updateData.last_name = payload.last_name;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.instagram !== undefined) updateData.instagram = payload.instagram.replace(/^@/, '');
  if (payload.whatsapp_opt_in !== undefined) {
    updateData.whatsapp_opt_in = payload.whatsapp_opt_in;
    if (payload.whatsapp_opt_in) updateData.whatsapp_opt_in_at = now;
  }
  if (payload.email_marketing_opt_in !== undefined) {
    updateData.email_marketing_opt_in = payload.email_marketing_opt_in;
    if (payload.email_marketing_opt_in) updateData.email_marketing_opt_in_at = now;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('heat_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (!error && data) {
      fallbackMembers.set(data.id, data as HeatMember);
      return data as HeatMember;
    }
  } catch (err) {
    console.warn('Supabase update member profile failed:', err);
  }

  const mem = fallbackMembers.get(memberId);
  if (mem) {
    if (payload.first_name !== undefined) mem.first_name = payload.first_name;
    if (payload.last_name !== undefined) mem.last_name = payload.last_name;
    if (payload.phone !== undefined) mem.phone = payload.phone;
    if (payload.instagram !== undefined) mem.instagram = payload.instagram.replace(/^@/, '');
    if (payload.whatsapp_opt_in !== undefined) {
      mem.whatsapp_opt_in = payload.whatsapp_opt_in;
      if (payload.whatsapp_opt_in) mem.whatsapp_opt_in_at = now;
    }
    if (payload.email_marketing_opt_in !== undefined) {
      mem.email_marketing_opt_in = payload.email_marketing_opt_in;
      if (payload.email_marketing_opt_in) mem.email_marketing_opt_in_at = now;
    }
    mem.updated_at = now;
    return mem;
  }

  return null;
}

