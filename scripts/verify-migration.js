const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n');
  
  // Verify paid_ads table
  console.log('📊 PAID_ADS TABLE:');
  
  const { count: paidAdsCount } = await supabase
    .from('paid_ads')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total records: ${paidAdsCount}`);
  
  // Get sample data
  const { data: paidAdsSample } = await supabase
    .from('paid_ads')
    .select('*')
    .limit(3)
    .order('month', { ascending: false });
  
  console.log('\nSample records:');
  paidAdsSample.forEach(record => {
    console.log(`- ${record.clinic} | ${new Date(record.month).toLocaleDateString()} | ${record.traffic_source} | ${record.campaign || 'N/A'}`);
  });
  
  // Get unique clinics
  const { data: paidAdsClinics } = await supabase
    .from('paid_ads')
    .select('clinic')
    .order('clinic');
  
  const uniquePaidAdsClinics = [...new Set(paidAdsClinics.map(r => r.clinic))];
  console.log(`\nUnique clinics: ${uniquePaidAdsClinics.length}`);
  console.log(uniquePaidAdsClinics.join(', '));
  
  // Get date range
  const { data: paidAdsDateRange } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);
  
  const { data: paidAdsDateRangeMax } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);
  
  console.log(`\nDate range: ${new Date(paidAdsDateRange[0].month).toLocaleDateString()} to ${new Date(paidAdsDateRangeMax[0].month).toLocaleDateString()}`);
  
  // Verify seo_channels table
  console.log('\n\n📊 SEO_CHANNELS TABLE:');
  
  const { count: seoCount } = await supabase
    .from('seo_channels')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total records: ${seoCount}`);
  
  // Get sample data
  const { data: seoSample } = await supabase
    .from('seo_channels')
    .select('*')
    .limit(3)
    .order('month', { ascending: false });
  
  console.log('\nSample records:');
  seoSample.forEach(record => {
    console.log(`- ${record.clinic} | ${new Date(record.month).toLocaleDateString()} | ${record.traffic_source}`);
  });
  
  // Get unique traffic sources
  const { data: seoTrafficSources } = await supabase
    .from('seo_channels')
    .select('traffic_source')
    .order('traffic_source');
  
  const uniqueSeoTrafficSources = [...new Set(seoTrafficSources.map(r => r.traffic_source))];
  console.log(`\nUnique traffic sources: ${uniqueSeoTrafficSources.length}`);
  console.log(uniqueSeoTrafficSources.join(', '));
  
  // Get date range
  const { data: seoDateRange } = await supabase
    .from('seo_channels')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);
  
  const { data: seoDateRangeMax } = await supabase
    .from('seo_channels')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);
  
  console.log(`\nDate range: ${new Date(seoDateRange[0].month).toLocaleDateString()} to ${new Date(seoDateRangeMax[0].month).toLocaleDateString()}`);
  
  // Summary
  console.log('\n\n✅ MIGRATION SUMMARY:');
  console.log(`- paid_ads: ${paidAdsCount} records migrated`);
  console.log(`- seo_channels: ${seoCount} records migrated`);
  console.log(`- Total records: ${paidAdsCount + seoCount}`);
}

verifyMigration().catch(console.error);