const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/admin/page.tsx', 'utf8');

// Import GalleryManager
code = code.replace(
  /import EarlyAccessManager from '@\/components\/admin\/EarlyAccessManager';/,
  "import EarlyAccessManager from '@/components/admin/EarlyAccessManager';\nimport GalleryManager from '@/components/admin/GalleryManager';"
);

// Add to State
code = code.replace(
  /useState<'events' \| 'guestlist' \| 'tickets' \| 'community' \| 'early_access'>\('community'\);/,
  "useState<'events' | 'guestlist' | 'tickets' | 'community' | 'early_access' | 'gallery'>('community');"
);

// Add Button
const buttonHtml = `              <button
                onClick={() => setActiveTab('gallery')}
                className={\`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm \${
                  activeTab === 'gallery'
                    ? 'bg-heat-chrome text-heat-black'
                    : 'text-heat-chrome hover:text-white'
                }\`}
              >
                Gallery
              </button>`;

code = code.replace(
  /              <button\n                onClick=\{\(\) => setActiveTab\('tickets'\)\}/,
  buttonHtml + "\n              <button\n                onClick={() => setActiveTab('tickets')}"
);

// Add to Render
code = code.replace(
  /            \) : activeTab === 'early_access' \? \(\n              <EarlyAccessManager \/>\n            \) : \(\n              <TicketManager \/>\n            \)\}/,
  ") : activeTab === 'early_access' ? (\n              <EarlyAccessManager />\n            ) : activeTab === 'gallery' ? (\n              <GalleryManager />\n            ) : (\n              <TicketManager />\n            )}"
);

fs.writeFileSync('src/app/[locale]/admin/page.tsx', code);
