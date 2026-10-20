import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Get the first active pre-registration event
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('id, title, event_date, background_video_url')
      .eq('pre_registration_active', true)
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'No active event' }, { status: 404 });
    }

    return NextResponse.json({
      id: event.id,
      title: event.title,
      date: event.event_date,
      videoUrl: event.background_video_url,
    });
  } catch (error) {
    console.error('Fetch event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
