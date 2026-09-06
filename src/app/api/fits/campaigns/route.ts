import { NextResponse } from 'next/server';
import { getActiveCampaign } from '@/lib/fits';

export async function GET() {
  try {
    const campaign = await getActiveCampaign();
    return NextResponse.json({ campaign });
  } catch (err: any) {
    console.error('Fetch campaign error:', err);
    return NextResponse.json({ campaign: null }, { status: 500 });
  }
}
