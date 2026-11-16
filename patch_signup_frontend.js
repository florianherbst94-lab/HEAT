const fs = require('fs');
let code = fs.readFileSync('src/components/home/CommunitySignup.tsx', 'utf8');

// Add state for 18+
code = code.replace(
  /const \[consent, setConsent\] = useState\(false\);/,
  "const [consent, setConsent] = useState(false);\n  const [is18Plus, setIs18Plus] = useState(false);"
);

// Add 18+ to submit validation
code = code.replace(
  /if \(\!consent\) \{/,
  "if (!is18Plus) {\n      alert('Du musst mindestens 18 Jahre alt sein, um dem HEAT CLUB beizutreten.');\n      return;\n    }\n    if (!consent) {"
);

// Add is18Plus to fetch payload
code = code.replace(
  /whatsapp_opt_in_source: 'homepage_signup'/,
  "whatsapp_opt_in_source: 'homepage_signup',\n          is_18_plus: is18Plus,\n          terms_accepted: consent"
);

// Update success message text
code = code.replace(
  /Deine Anmeldung war erfolgreich\./,
  "Wir haben dir eine E-Mail gesendet. Bitte klicke auf den Link in der E-Mail, um deine Anmeldung abzuschließen."
);

// Add checkbox for 18+ before the consent checkbox
code = code.replace(
  /<div className="flex items-start gap-3 mt-2 text-left">/,
  `<div className="flex items-start gap-3 mt-4 text-left">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              id="club-18plus"
                              checked={is18Plus}
                              onChange={(e) => setIs18Plus(e.target.checked)}
                              className="w-4 h-4 rounded border-heat-chrome-dark bg-heat-black accent-heat-red"
                              required
                            />
                          </div>
                          <label htmlFor="club-18plus" className="text-xs text-heat-chrome leading-relaxed cursor-pointer">
                            Ich bestätige, dass ich mindestens 18 Jahre alt bin.*
                          </label>
                        </div>
                        <div className="flex items-start gap-3 mt-2 text-left">`
);

fs.writeFileSync('src/components/home/CommunitySignup.tsx', code);
