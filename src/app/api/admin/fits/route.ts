import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAllCampaigns,
  createOrUpdateCampaign,
  duplicateCampaign,
  getPendingEntries,
  updateEntryStatus,
  deleteEntry,
  getCampaignEntries,
  assignWinnerBadge,
  removeWinnerBadge,
} from '@/lib/fits';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');

    const campaigns = await getAllCampaigns();
    const pendingEntries = await getPendingEntries();

    let campaignEntries: any[] = [];
    if (campaignId) {
      campaignEntries = await getCampaignEntries(campaignId, 'hottest');
    } else if (campaigns.length > 0) {
      campaignEntries = await getCampaignEntries(campaigns[0].id, 'hottest');
    }

    return NextResponse.json({
      campaigns,
      pendingEntries,
      campaignEntries,
    });
  } catch (err: any) {
    console.error('Admin fits GET error:', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'save_campaign') {
      const campaign = await createOrUpdateCampaign(body.campaign);
      return NextResponse.json({ success: true, campaign });
    }

    if (action === 'duplicate_campaign') {
      const campaign = await duplicateCampaign(body.campaign_id);
      return NextResponse.json({ success: true, campaign });
    }

    if (action === 'moderate_entry') {
      const { entry_id, status } = body;
      await updateEntryStatus(entry_id, status);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_entry') {
      const { entry_id } = body;
      await deleteEntry(entry_id);
      return NextResponse.json({ success: true });
    }

    if (action === 'assign_winner') {
      const { campaign_id, entry_id, winner_type, badge_title } = body;
      const winner = await assignWinnerBadge(campaign_id, entry_id, winner_type, badge_title);
      return NextResponse.json({ success: true, winner });
    }

    if (action === 'remove_winner') {
      const { winner_id } = body;
      await removeWinnerBadge(winner_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin fits POST error:', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
