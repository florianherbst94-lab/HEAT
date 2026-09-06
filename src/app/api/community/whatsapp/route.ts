import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberBySessionToken, updateWhatsAppOptIn } from '@/lib/community';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('heat_member_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
    }

    const member = await getMemberBySessionToken(token);
    if (!member) {
      return NextResponse.json({ error: 'Ungültiges Mitgliedskonto.' }, { status: 401 });
    }

    const body = await req.json();
    const { phone, source } = body;

    const updated = await updateWhatsAppOptIn(
      member.id,
      phone || undefined,
      source || 'heat_fits_vote'
    );

    return NextResponse.json({
      success: true,
      whatsapp_opt_in: true,
      whatsapp_opt_in_at: updated?.whatsapp_opt_in_at,
    });
  } catch (err: any) {
    console.error('WhatsApp opt-in error:', err);
    return NextResponse.json({ error: 'Opt-in konnte nicht gespeichert werden.' }, { status: 500 });
  }
}
