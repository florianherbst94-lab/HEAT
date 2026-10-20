const fs = require('fs');

const filePath = 'src/app/[locale]/admin/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add EarlyAccessManager import
if (!content.includes('import EarlyAccessManager')) {
  content = content.replace(
    "import AdminGuard from '@/components/admin/AdminGuard';",
    "import AdminGuard from '@/components/admin/AdminGuard';\nimport EarlyAccessManager from '@/components/admin/EarlyAccessManager';"
  );
}

// Update the type
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'events' | 'guestlist' | 'tickets' | 'community'>('community');",
  "const [activeTab, setActiveTab] = useState<'events' | 'guestlist' | 'tickets' | 'community' | 'early_access'>('community');"
);

// Add the button
const newButton = `
              <button
                onClick={() => setActiveTab('early_access')}
                className={\`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm \${
                  activeTab === 'early_access'
                    ? 'bg-heat-chrome text-heat-black'
                    : 'text-heat-chrome hover:text-white'
                }\`}
              >
                Early Access
              </button>
`;

if (!content.includes("setActiveTab('early_access')")) {
  content = content.replace(
    "              <button\n                onClick={() => setActiveTab('tickets')}",
    newButton + "              <button\n                onClick={() => setActiveTab('tickets')}"
  );
}

// Update the rendering logic
if (!content.includes('<EarlyAccessManager />')) {
  content = content.replace(
    ": activeTab === 'guestlist' ? (\n              <GuestlistManager />\n            ) : (\n              <TicketManager />\n            )}",
    ": activeTab === 'guestlist' ? (\n              <GuestlistManager />\n            ) : activeTab === 'early_access' ? (\n              <EarlyAccessManager />\n            ) : (\n              <TicketManager />\n            )}"
  );
}

fs.writeFileSync(filePath, content);
