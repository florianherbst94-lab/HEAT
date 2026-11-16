const fs = require('fs');
let code = fs.readFileSync('src/components/admin/EarlyAccessManager.tsx', 'utf8');

console.log(code.match(/async function fetchRegistrations\(\) \{[\s\S]*?\}/)[0]);
