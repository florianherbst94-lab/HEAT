const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');

code = code.replace(
  /export const metadata: Metadata = \{([\s\S]*?)\};/,
  "export const metadata: Metadata = {$1, icons: { icon: '/media/logo.png', apple: '/media/logo.png' } };"
);

fs.writeFileSync('src/app/[locale]/layout.tsx', code);
