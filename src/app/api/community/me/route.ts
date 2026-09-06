import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberBySessionToken } from '@/lib/community';
import { getActiveCampaign, getMemberVotesCount } from '@/lib/fits';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('heat_member_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const member = await getMemberBySessionToken(token);
    if (!member) {
      return NextResponse.json({ authenticated: false });
    }

    const activeCampaign = await getActiveCampaign();
    let votesUsed = 0;
    if (activeCampaign) {
      votesUsed = await getMemberVotesCount(activeCampaign.id, member.id);
    }

    return NextResponse.json({
      authenticated: true,
      member: {
        id: member.id,
        member_number: member.member_number,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        instagram: member.instagram,
        phone: member.phone,
        whatsapp_opt_in: member.whatsapp_opt_in,
        email_marketing_opt_in: member.email_marketing_opt_in,
      },
      campaign: activeCampaign
        ? {
            id: activeCampaign.id,
            max_votes: activeCampaign.max_votes_per_member,
            votes_used: votesUsed,
            remaining_votes: Math.max(0, activeCampaign.max_votes_per_member - votesUsed),
          }
        : null,
    });
  } catch (err: any) {
    console.error('Community me query error:', err);
    return NextResponse.json({ authenticated: false });
  }
}
