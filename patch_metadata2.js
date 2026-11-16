const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');

const newMetadata = `export const metadata: Metadata = {
  title: "HEAT",
  description: "Heat ist mehr als eine Party. Hip-Hop, Afro, R&B, Amapiano.",
  openGraph: {
    title: "HEAT | The First Chapter",
    description: "Heat ist mehr als eine Party. Hip-Hop, Afro, R&B, Amapiano.",
    url: 'https://heatdresden.de',
    siteName: 'HEAT',
    locale: 'de_DE',
    type: 'website',
  }
};`;

code = code.replace(
  /export const metadata: Metadata = \{[\s\S]*?\};\n/,
  newMetadata + '\n'
);

fs.writeFileSync('src/app/[locale]/layout.tsx', code);
