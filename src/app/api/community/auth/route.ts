import { NextResponse } from 'next/server';
import { createOrUpdateMember } from '@/lib/community';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { CommunityConfirmEmail } from '@/emails/CommunityConfirmEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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
      status: 'pending' // DO NOT ACTIVATE YET
    });

    // Create JWT for confirmation
    const token = jwt.sign(
      { memberId: member.id, email: member.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const confirmUrl = `https://heatdresden.de/api/community/confirm?token=${token}`;

    // Send Double-Opt-In Email
    await resend.emails.send({
      from: 'Heat Club <club@heatdresden.de>',
      to: [email],
      subject: 'HEAT CLUB - Bestätige deine Anmeldung',
      react: CommunityConfirmEmail({
        firstName: first_name,
        confirmLink: confirmUrl,
      }) as React.ReactElement,
    });

    // We do NOT set the cookie here yet!
    return NextResponse.json({ success: true, pending: true });
  } catch (err: any) {
    console.error('Community auth error:', err);
    return NextResponse.json({ error: 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.' }, { status: 500 });
  }
}
