const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

code = code.replace(
  /href="https:\/\/instagram\.com\/heatdresden"/,
  'href="https://instagram.com/heat.dresden"'
);

fs.writeFileSync('src/components/layout/Footer.tsx', code);
