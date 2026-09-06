import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberBySessionToken } from '@/lib/community';
import { getActiveCampaign, getCampaignEntries } from '@/lib/fits';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get('sort') as 'hottest' | 'new') || 'hottest';
    const campaignIdParam = searchParams.get('campaign_id');

    let campaignId = campaignIdParam;
    let campaign = null;

    if (!campaignId) {
      campaign = await getActiveCampaign();
      campaignId = campaign?.id || null;
    }

    if (!campaignId) {
      return NextResponse.json({ entries: [], campaign: null });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('heat_member_token')?.value;
    let currentMemberId: string | undefined = undefined;
    if (token) {
      const member = await getMemberBySessionToken(token);
      if (member) currentMemberId = member.id;
    }

    const entries = await getCampaignEntries(campaignId, sort, currentMemberId);

    return NextResponse.json({
      entries,
      campaign: campaign || { id: campaignId },
      show_vote_count: campaign ? campaign.show_vote_count : true,
    });
  } catch (err: any) {
    console.error('Fetch entries error:', err);
    return NextResponse.json({ entries: [], campaign: null }, { status: 500 });
  }
}
