const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

code = code.replace(
  /<h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-heat-red font-bold tracking-widest uppercase mb-4">\s*H♥AT\s*<\/h1>/g,
  `<h1 className="mb-6 flex justify-center">
                <img src="/media/logo.png" alt="HEAT" className="h-10 md:h-14 lg:h-16 w-auto drop-shadow-md" />
              </h1>`
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
