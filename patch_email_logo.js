const fs = require('fs');
let code = fs.readFileSync('src/emails/EarlyAccessConfirmEmail.tsx', 'utf8');

// Replace the H♥AT text with the logo image
// Need to add Img import from @react-email/components
code = code.replace(
  /  Html,\n  Link,\n  Preview,/,
  "  Html,\n  Img,\n  Link,\n  Preview,"
);

const logoReplacement = `<Img 
                src="https://heatdresden.de/media/logo.png" 
                width="150" 
                height="auto" 
                alt="HEAT Logo" 
                className="mx-auto" 
              />`;

code = code.replace(
  /<Text className="text-4xl font-display text-heatRed font-bold tracking-widest uppercase m-0 flex items-center justify-center gap-2">[\s\S]*?<\/Text>/,
  logoReplacement
);

fs.writeFileSync('src/emails/EarlyAccessConfirmEmail.tsx', code);
