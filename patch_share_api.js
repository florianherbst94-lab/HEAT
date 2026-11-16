const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

const newShareLogic = `
              <button
                onClick={async () => {
                  const shareData = {
                    title: 'HEAT - The First Chapter',
                    text: 'Ich stehe auf der exklusiven Liste für das erste HEAT Event. Sichere dir auch Early Access!',
                    url: 'https://access.heatdresden.de'
                  };
                  
                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    try {
                      await navigator.share(shareData);
                    } catch (err) {
                      console.error('Error sharing:', err);
                    }
                  } else {
                    navigator.clipboard.writeText(shareData.url);
                    alert('Link kopiert!');
                  }
                }}
                className="inline-flex items-center gap-2 bg-heat-anthracite border border-heat-chrome-dark hover:border-heat-chrome text-white px-6 py-3 rounded-sm transition-colors text-sm uppercase tracking-wider font-bold"
              >
`;

code = code.replace(
  /              <button\s+onClick=\{\(\) => \{\s+navigator\.clipboard\.writeText\('https:\/\/access\.heatdresden\.de'\);\s+alert\('Link kopiert!'\);\s+\}\}\s+className="inline-flex items-center gap-2 bg-heat-anthracite border border-heat-chrome-dark hover:border-heat-chrome text-white px-6 py-3 rounded-sm transition-colors text-sm uppercase tracking-wider font-bold"\s+>/,
  newShareLogic
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
