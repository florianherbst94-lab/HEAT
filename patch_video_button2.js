const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/access/page.tsx', 'utf8');

// I might have appended it outside the main container or not correctly inserted it
// Let's print the end of the file to see where it went
console.log(code.substring(code.length - 1500));
