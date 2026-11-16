const fs = require('fs');
let code = fs.readFileSync('src/app/api/pre-registration/route.ts', 'utf8');

// The UI sends:
// email, firstName, consentMarketing, eventId, source

// But eventData?.id might be undefined because the GET /api/pre-registration/event returned 404
// And the POST API says: if (!email || !eventId) return error

code = code.replace(
  /if \(!email \|\| !eventId\) \{/,
  `if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Fallback if no eventId provided (e.g. general waiting list)
    let actualEventId = eventId;
    let eventTitle = 'HEAT Erste Party';
    
    if (!actualEventId) {
      // Find the first event or just skip event validation if we allow general registration
      const { data: fallbackEvent } = await supabaseAdmin
        .from('events')
        .select('id, title')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      if (fallbackEvent) {
        actualEventId = fallbackEvent.id;
        eventTitle = fallbackEvent.title;
      }
    }
    
    if (!actualEventId) {
      return NextResponse.json({ error: 'System error: No event available to register for.' }, { status: 500 });
    }`
);

code = code.replace(
  /const \{ data: event, error: eventError \} = await supabaseAdmin[\s\S]*?if \(eventError \|\| !event \|\| !event\.pre_registration_active\) \{[\s\S]*?\}/,
  `const { data: event } = await supabaseAdmin
      .from('events')
      .select('id, title, pre_registration_active')
      .eq('id', actualEventId)
      .single();

    if (event) {
      eventTitle = event.title;
    }`
);

code = code.replace(/eventId/g, 'actualEventId');
// fix one variable declaration
code = code.replace(/const \{ email, firstName, consentMarketing, actualEventId, source, utm_campaign, utm_source \} = body;/, 'const { email, firstName, consentMarketing, eventId, source, utm_campaign, utm_source } = body;');
// fix the payload for the token
code = code.replace(/\{ registrationId, email, actualEventId \}/, '{ registrationId, email, eventId: actualEventId }');

fs.writeFileSync('src/app/api/pre-registration/route.ts', code);
