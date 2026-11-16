const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clear() {
  const { data, error } = await supabase
    .from('pre_registrations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
    
  console.log('Cleared registrations:', data);
  console.log('Error:', error);
}
clear();
