const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');
content = content.replace('notFound();', 'console.log("NOT FOUND LOCALE:", locale); notFound();');
fs.writeFileSync('src/app/[locale]/layout.tsx', content);
