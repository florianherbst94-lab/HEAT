const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/early-access/route.ts', 'utf8');

// In Next.js 16 (or newer 15), cookies() is an asynchronous operation, meaning we must use await cookies().get(...)

code = code.replace(
  /function checkAdmin\(\) \{/,
  "async function checkAdmin() {"
);
code = code.replace(
  /const adminCookie = cookies\(\)\.get\('admin_session'\);/,
  "const cookieStore = await cookies();\n  const adminCookie = cookieStore.get('admin_session');"
);
code = code.replace(
  /if \(!checkAdmin\(\)\) \{/g,
  "if (!(await checkAdmin())) {"
);

fs.writeFileSync('src/app/api/admin/early-access/route.ts', code);
