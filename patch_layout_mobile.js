const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');

// The issue might be that the pathname in layout is not updating or that we need a different check for layout hiding
// Wait, the user said the main page layout is showing on access.heatdresden.de? 
// No, the user said "If I enter access.heat.dresden on mobile, I still get the normal main page".
