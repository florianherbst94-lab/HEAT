const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');
content = content.replace('console.log("NOT FOUND LOCALE:", locale);', 'console.log("NOT FOUND LOCALE:", locale, "AVAILABLE LOCALES:", routing.locales);');
fs.writeFileSync('src/app/[locale]/layout.tsx', content);
