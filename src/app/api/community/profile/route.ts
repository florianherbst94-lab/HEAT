import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberBySessionToken, updateMemberProfile } from '@/lib/community';

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('heat_member_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
    }

    const currentMember = await getMemberBySessionToken(token);
    if (!currentMember) {
      return NextResponse.json({ error: 'Mitgliedskonto nicht gefunden.' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateMemberProfile(currentMember.id, body);

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Profil konnte nicht aktualisiert werden.' }, { status: 500 });
  }
}
