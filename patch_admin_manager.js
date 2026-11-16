const fs = require('fs');
let code = fs.readFileSync('src/components/admin/EarlyAccessManager.tsx', 'utf8');

code = code.replace(/import \{ supabase \} from '@\/lib\/supabase';\n/g, "");

code = code.replace(
  /  async function fetchRegistrations\(\) \{[\s\S]*?\}\n/,
  `  async function fetchRegistrations() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/early-access');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }
`
);

code = code.replace(
  /  async function deleteRegistration\(id: string\) \{[\s\S]*?\n  \}\n/g,
  `  async function deleteRegistration(id: string) {
    if (!confirm('Bist du sicher, dass du diesen Eintrag löschen möchtest?')) return;
    
    try {
      const res = await fetch(\`/api/admin/early-access?id=\${id}\`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        alert('Eintrag gelöscht');
        fetchRegistrations();
      } else {
        alert('Fehler beim Löschen');
      }
    } catch (err) {
      alert('Fehler beim Löschen');
    }
  }
`
);

fs.writeFileSync('src/components/admin/EarlyAccessManager.tsx', code);
