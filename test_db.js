const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('events').select('*');
  console.log('Events:', data);
  console.log('Error:', error);
  
  const { data: regs, error: regError } = await supabase.from('pre_registrations').select('*');
  console.log('Registrations:', regs?.length);
  console.log('Reg Error:', regError);
}
test();
