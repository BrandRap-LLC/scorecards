const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSupabaseStructure() {
  console.log('Checking Supabase table structures...\n');

  // Check paid_ads structure
  console.log('📊 paid_ads table:');
  const { data: paidAdsData, error: paidAdsError } = await supabase
    .from('paid_ads')
    .select('*')
    .limit(1);
  
  if (!paidAdsError && paidAdsData?.length > 0) {
    console.log('Columns:');
    Object.keys(paidAdsData[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof paidAdsData[0][col]}`);
    });
    console.log('\nSample record:');
    console.log(JSON.stringify(paidAdsData[0], null, 2));
  }

  // Check seo_channels structure
  console.log('\n\n📊 seo_channels table:');
  const { data: seoChannelsData, error: seoChannelsError } = await supabase
    .from('seo_channels')
    .select('*')
    .limit(1);
  
  if (!seoChannelsError && seoChannelsData?.length > 0) {
    console.log('Columns:');
    Object.keys(seoChannelsData[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof seoChannelsData[0][col]}`);
    });
  }

  // Check seo_highlights_keyword_page_one structure
  console.log('\n\n📊 seo_highlights_keyword_page_one table:');
  const { data: seoKeywordsData, error: seoKeywordsError } = await supabase
    .from('seo_highlights_keyword_page_one')
    .select('*')
    .limit(1);
  
  if (!seoKeywordsError && seoKeywordsData?.length > 0) {
    console.log('Columns:');
    Object.keys(seoKeywordsData[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof seoKeywordsData[0][col]}`);
    });
  }
}

checkSupabaseStructure().catch(console.error);