const fs = require('fs');
let code = fs.readFileSync('src/components/admin/EarlyAccessManager.tsx', 'utf8');

// The issue might be that the dummy event I created via the API has a null or malformed date, causing the date parsing to crash in the UI.
// Let's ensure the event date parsing doesn't crash the component if it's null or missing.

code = code.replace(
  /\{ev\.title\} \(\{new Date\(ev\.event_date\)\.toLocaleDateString\('de-DE'\)\}\)/g,
  "{ev.title} ({ev.event_date ? new Date(ev.event_date).toLocaleDateString('de-DE') : 'No Date'})"
);

fs.writeFileSync('src/components/admin/EarlyAccessManager.tsx', code);
