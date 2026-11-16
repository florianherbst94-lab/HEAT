const fs = require('fs');
let code = fs.readFileSync('src/app/api/pre-registration/route.ts', 'utf8');

// The best way to know why it's failing is to log the specific Supabase error and return it in the response for debugging.
code = code.replace(
  /        return NextResponse\.json\(\{ error: 'Registration failed' \}, \{ status: 500 \}\);/,
  `        return NextResponse.json({ error: 'Registration failed: ' + insertError.message, details: insertError }, { status: 500 });`
);

fs.writeFileSync('src/app/api/pre-registration/route.ts', code);
