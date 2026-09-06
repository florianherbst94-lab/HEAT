import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createOrUpdateMember } from '@/lib/community';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      instagram,
      birthdate,
      is_18_plus,
      whatsapp_opt_in,
      whatsapp_opt_in_source,
      email_marketing_opt_in,
      terms_accepted,
    } = body;

    if (!first_name || !email) {
      return NextResponse.json({ error: 'Vorname und E-Mail sind erforderlich.' }, { status: 400 });
    }

    if (!is_18_plus) {
      return NextResponse.json({ error: 'Du musst mindestens 18 Jahre alt sein, um dem HEAT CLUB beizutreten.' }, { status: 400 });
    }

    if (!terms_accepted) {
      return NextResponse.json({ error: 'Bitte stimme den Datenschutzbestimmungen zu.' }, { status: 400 });
    }

    const member = await createOrUpdateMember({
      first_name,
      last_name,
      email,
      phone,
      instagram,
      birthdate,
      is_18_plus,
      whatsapp_opt_in,
      whatsapp_opt_in_source: whatsapp_opt_in_source || 'community_signup',
      email_marketing_opt_in,
      terms_accepted,
    });

    // Set persistent long-term HTTP-only cookie (1 year expiry)
    const cookieStore = await cookies();
    cookieStore.set('heat_member_token', member.session_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
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
        whatsapp_opt_in: member.whatsapp_opt_in,
        email_marketing_opt_in: member.email_marketing_opt_in,
      },
    });
  } catch (err: any) {
    console.error('Community auth error:', err);
    return NextResponse.json({ error: 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.' }, { status: 500 });
  }
}
