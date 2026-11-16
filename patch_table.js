const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function patch() {
  const sql = `
    CREATE TABLE IF NOT EXISTS gallery_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  // We can't run raw SQL directly with supabase-js easily unless we use rpc.
  // Let's just check if the table exists by doing a select.
  const { data, error } = await supabase.from('gallery_images').select('*').limit(1);
  console.log('Table check result:', error);
}
patch();
