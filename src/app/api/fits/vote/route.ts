import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberBySessionToken } from '@/lib/community';
import { toggleVote } from '@/lib/fits';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('heat_member_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'JOIN THE HEAT CLUB TO VOTE', require_auth: true },
        { status: 401 }
      );
    }

    const member = await getMemberBySessionToken(token);
    if (!member) {
      return NextResponse.json(
        { error: 'Mitgliedskonto abgelaufen oder ungültig.', require_auth: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { campaign_id, entry_id } = body;

    if (!campaign_id || !entry_id) {
      return NextResponse.json({ error: 'Fehlende Campaign oder Entry ID.' }, { status: 400 });
    }

    const result = await toggleVote(campaign_id, entry_id, member.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Vote konnte nicht verarbeitet werden.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      has_voted: result.has_voted,
      remaining_votes: result.remaining_votes,
    });
  } catch (err: any) {
    console.error('Fit vote error:', err);
    return NextResponse.json({ error: 'Serverseitiger Fehler beim Voten.' }, { status: 500 });
  }
}
