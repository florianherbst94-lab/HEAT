const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// The logo is currently h-10 md:h-14 lg:h-16. Let's make it twice as big.
// h-20 md:h-28 lg:h-32

code = code.replace(
  /className="h-10 md:h-14 lg:h-16 w-auto drop-shadow-md"/,
  'className="h-20 md:h-28 lg:h-32 w-auto drop-shadow-md"'
);

fs.writeFileSync('src/app/[locale]/access/page.tsx', code);
