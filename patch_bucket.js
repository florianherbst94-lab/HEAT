const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function patch() {
  const { data, error } = await supabase
    .storage
    .createBucket('gallery', { public: true });
    
  console.log('Bucket create result:', data, error);
}
patch();
