const fs = require('fs');
let code = fs.readFileSync('src/components/admin/EarlyAccessManager.tsx', 'utf8');

// I assumed createClientComponentClient was from '@supabase/auth-helpers-nextjs', but this project might use standard supabase-js client side
// or something else. Let's see what is used in TicketManager or GuestlistManager.
// But first, let's fix the imports.

code = code.replace(
  /import \{ createClientComponentClient \} from '@supabase\/auth-helpers-nextjs';/,
  "import { supabase } from '@/lib/supabase';"
);

// We also don't have react-hot-toast. Let's replace it with native alert/console for now, or check if it exists in package.json
// Let's just remove react-hot-toast and use alert.

code = code.replace(
  /import toast from 'react-hot-toast';/,
  ""
);

code = code.replace(/toast\.error\(/g, "alert(");
code = code.replace(/toast\.success\(/g, "alert(");
code = code.replace(/const supabase = createClientComponentClient\(\);/g, "");

fs.writeFileSync('src/components/admin/EarlyAccessManager.tsx', code);
