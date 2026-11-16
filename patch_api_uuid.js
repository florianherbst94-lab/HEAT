const fs = require('fs');
let code = fs.readFileSync('src/app/api/pre-registration/route.ts', 'utf8');

// The fallback UUID is invalid format because of foreign key constraint to events.id!
// The events table probably doesn't have an event with id '00000000-0000-0000-0000-000000000000'.
// We need to actually create a default event if none exist, or we must use an existing event.
// Let's modify the API so it removes the fallback UUID if it fails.

code = code.replace(
  /        \/\/ If DB is completely empty, use a hardcoded UUID so registration still works\n        actualEventId = '00000000-0000-0000-0000-000000000000';/g,
  `        // If DB is completely empty, we MUST return an error because of foreign key constraint
        return NextResponse.json({ error: 'System is still booting up. No events configured yet.' }, { status: 500 });`
);

fs.writeFileSync('src/app/api/pre-registration/route.ts', code);
