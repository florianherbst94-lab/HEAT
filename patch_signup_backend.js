const fs = require('fs');
let code = fs.readFileSync('src/components/home/CommunitySignup.tsx', 'utf8');

// Replace the simulate success setTimeout with a real fetch call
code = code.replace(
  /\/\/ TODO: Connect to backend API later[\s\S]*?\}, 1000\);/,
  `try {
      const res = await fetch('/api/community/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          instagram,
          phone: mobileNumber,
          whatsapp_opt_in: true,
          whatsapp_opt_in_source: 'homepage_signup'
        })
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json();
        alert(data.error || 'Es gab einen Fehler bei der Anmeldung. Bitte versuche es später erneut.');
      }
    } catch (err) {
      alert('Netzwerkfehler. Bitte überprüfe deine Verbindung.');
    } finally {
      setLoading(false);
    }`
);

fs.writeFileSync('src/components/home/CommunitySignup.tsx', code);
