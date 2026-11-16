const fs = require('fs');
let code = fs.readFileSync('src/lib/community.ts', 'utf8');

// Add pending to status type
code = code.replace(
  /status: 'active' \| 'suspended' \| 'deleted';/,
  "status: 'active' | 'pending' | 'suspended' | 'deleted';"
);

// Add status to payload of createOrUpdateMember
code = code.replace(
  /  terms_accepted\?: boolean;\n\}: Promise<HeatMember> \{/,
  "  terms_accepted?: boolean;\n  status?: 'active' | 'pending';\n}: Promise<HeatMember> {"
);

// Use payload.status in createOrUpdateMember
code = code.replace(
  /status: 'active',/g,
  "status: payload.status || 'active',"
);

fs.writeFileSync('src/lib/community.ts', code);
