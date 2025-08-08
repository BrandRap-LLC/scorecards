const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking for tables in Supabase...\n');
  
  // Check paid_ads table
  console.log('Checking paid_ads table...');
  const { data: paidAdsData, error: paidAdsError } = await supabase
    .from('paid_ads')
    .select('*')
    .limit(1);
  
  if (paidAdsError) {
    if (paidAdsError.code === '42P01') {
      console.log('❌ paid_ads table does not exist');
    } else {
      console.log('⚠️  Error checking paid_ads:', paidAdsError.message);
    }
  } else {
    const { count } = await supabase
      .from('paid_ads')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ paid_ads table exists with ${count} records`);
  }
  
  // Check seo_channels table
  console.log('\nChecking seo_channels table...');
  const { data: seoData, error: seoError } = await supabase
    .from('seo_channels')
    .select('*')
    .limit(1);
  
  if (seoError) {
    if (seoError.code === '42P01') {
      console.log('❌ seo_channels table does not exist');
    } else {
      console.log('⚠️  Error checking seo_channels:', seoError.message);
    }
  } else {
    const { count } = await supabase
      .from('seo_channels')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ seo_channels table exists with ${count} records`);
  }
}

checkTables();