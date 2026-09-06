import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginMemberByEmail } from '@/lib/community';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Bitte gib deine E-Mail Adresse ein.' }, { status: 400 });
    }

    const member = await loginMemberByEmail(email);
    if (!member) {
      return NextResponse.json({ error: 'Kein HEAT CLUB Konto mit dieser E-Mail gefunden. Bitte registriere dich zuerst.' }, { status: 404 });
    }

    // Set persistent 1-year auth cookie
    const cookieStore = await cookies();
    cookieStore.set('heat_member_token', member.session_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
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
    });
  } catch (err: any) {
    console.error('Member login error:', err);
    return NextResponse.json({ error: 'Anmeldung fehlgeschlagen.' }, { status: 500 });
  }
}
