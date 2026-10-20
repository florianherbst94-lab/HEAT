import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { EarlyAccessConfirmEmail } from '@/emails/EarlyAccessConfirmEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, consentMarketing, eventId, source, utm_campaign, utm_source } = body;

    if (!email || !eventId) {
      return NextResponse.json({ error: 'Email and eventId are required' }, { status: 400 });
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, pre_registration_active')
      .eq('id', eventId)
      .single();

    if (eventError || !event || !event.pre_registration_active) {
      return NextResponse.json({ error: 'Pre-registration is not active for this event' }, { status: 400 });
    }

    // Check if user already registered for this event
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('pre_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('email', email)
      .single();

    if (existing && existing.status === 'confirmed') {
      return NextResponse.json({ error: 'Email already registered and confirmed for this event' }, { status: 400 });
    }

    let registrationId = existing?.id;

    if (!existing) {
      const { data: newReg, error: insertError } = await supabaseAdmin
        .from('pre_registrations')
        .insert({
          event_id: eventId,
          email,
          first_name: firstName,
          consent_marketing: consentMarketing,
          source,
          utm_campaign,
          utm_source,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error', insertError);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
      }
      registrationId = newReg.id;
    } else {
      // Update existing pending
      await supabaseAdmin
        .from('pre_registrations')
        .update({
          first_name: firstName,
          consent_marketing: consentMarketing,
        })
        .eq('id', registrationId);
    }

    // Generate JWT token for confirmation
    const token = jwt.sign(
      { registrationId, email, eventId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const confirmUrl = `https://access.heatdresden.de/api/pre-registration/confirm?token=${token}`;

    // Send Double-Opt-In Email
    await resend.emails.send({
      from: 'Heat Events <tickets@heatdresden.de>',
      to: [email],
      subject: 'HEAT - Confirm Your Early Access',
      react: EarlyAccessConfirmEmail({
        firstName,
        eventName: event.title,
        confirmLink: confirmUrl,
      }) as React.ReactElement,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pre-registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
