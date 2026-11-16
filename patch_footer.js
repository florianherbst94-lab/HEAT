const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

// We need to add the same pathname check in the footer to hide it on /access
code = code.replace(
  /export default function Footer\(\) \{/,
  `export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/access') return null;`
);

fs.writeFileSync('src/components/layout/Footer.tsx', code);
