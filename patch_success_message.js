const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

code = code.replace(
  /Überprüfe deinen Posteingang und bestätige deine E-Mail, um deinen Early Access zu sichern\./,
  "Überprüfe deinen Posteingang (und gegebenenfalls den Spam-Ordner) und bestätige deine E-Mail, um deinen Early Access zu sichern."
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
