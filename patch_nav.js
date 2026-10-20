const fs = require('fs');

function patchFile(filePath, addLogic) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = addLogic(content);
  fs.writeFileSync(filePath, content);
}

patchFile('src/components/layout/Navigation.tsx', (content) => {
  if (content.includes("if (pathname === '/access') return null;")) return content;
  return content.replace(
    'const pathname = usePathname();',
    `const pathname = usePathname();
  if (pathname === '/access') return null;`
  );
});

patchFile('src/components/layout/Footer.tsx', (content) => {
  if (content.includes("if (pathname === '/access') return null;")) return content;
  return content.replace(
    'export default function Footer() {',
    `import { usePathname } from '@/i18n/routing';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/access') return null;`
  );
});

patchFile('src/components/layout/AudioPlayer.tsx', (content) => {
  if (content.includes("if (pathname === '/access') return null;")) return content;
  return content.replace(
    'export default function AudioPlayer() {',
    `import { usePathname } from '@/i18n/routing';

export default function AudioPlayer() {
  const pathname = usePathname();
  if (pathname === '/access') return null;`
  );
});

