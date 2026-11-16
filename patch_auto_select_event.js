const fs = require('fs');
let code = fs.readFileSync('src/components/admin/EarlyAccessManager.tsx', 'utf8');

// The issue is that the user has to select an event from the dropdown FIRST before the table shows up.
// Let's auto-select the first event if one exists, so the table shows up immediately.

code = code.replace(
  /  async function fetchEvents\(\) \{\n    setLoading\(true\);\n    const \{ data, error \} = await supabase\n      \.from\('events'\)\n      \.select\('\*'\)\n      \.order\('event_date', \{ ascending: false \}\);\n    \n    if \(data\) setEvents\(data\);\n    setLoading\(false\);\n  \}/,
  `  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });
    
    if (data) {
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    }
    setLoading(false);
  }`
);

fs.writeFileSync('src/components/admin/EarlyAccessManager.tsx', code);
