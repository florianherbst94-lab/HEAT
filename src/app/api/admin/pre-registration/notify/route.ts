import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import { EarlyAccessNotifyEmail } from '@/emails/EarlyAccessNotifyEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, ticketLink } = body;

    // TODO: Verify Admin Session / Token
    // We assume the frontend sends this securely or middleware handles admin auth

    if (!eventId || !ticketLink) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Fetch Event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('title, event_date')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch all confirmed but un-notified users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('pre_registrations')
      .select('id, email, first_name')
      .eq('event_id', eventId)
      .eq('status', 'confirmed')
      .eq('notification_sent', false);

    if (usersError || !users || users.length === 0) {
      return NextResponse.json({ message: 'No pending users to notify', count: 0 });
    }

    // Send emails (In a real scenario, use Resend's bulk endpoint or batching)
    const MAX_BATCH = 100; // Limit for demo
    let sentCount = 0;

    for (let i = 0; i < Math.min(users.length, MAX_BATCH); i++) {
      const user = users[i];
      try {
        await resend.emails.send({
          from: 'Heat Events <tickets@heatdresden.de>',
          to: [user.email],
          subject: 'YOU\'RE FIRST. HEAT TICKETS ARE LIVE.',
          react: EarlyAccessNotifyEmail({
            firstName: user.first_name,
            eventName: event.title,
            eventDate: new Date(event.event_date).toLocaleDateString('de-DE'),
            ticketLink,
          }) as React.ReactElement,
        });

        // Mark as sent
        await supabaseAdmin
          .from('pre_registrations')
          .update({ notification_sent: true })
          .eq('id', user.id);
          
        sentCount++;
      } catch (err) {
        console.error('Failed to send to', user.email, err);
      }
    }

    return NextResponse.json({ success: true, count: sentCount, total: users.length });
  } catch (error) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
