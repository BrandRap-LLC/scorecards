const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPercentageFormat() {
  console.log('🔍 Checking Percentage Format in Database\n');
  console.log('=' .repeat(60));
  
  const testClinic = 'advancedlifeclinic.com';
  
  // Check executive_monthly_reports
  console.log('\n📊 Executive Monthly Reports - Conversion Rates:');
  const { data: execData } = await supabase
    .from('executive_monthly_reports')
    .select('month, total_conversion, new_conversion, returning_conversion')
    .eq('clinic', testClinic)
    .eq('traffic_source', 'Paid Social')
    .order('month', { ascending: false })
    .limit(3);
  
  execData?.forEach(row => {
    console.log(`\n${row.month}:`);
    console.log(`  total_conversion: ${row.total_conversion} (raw value)`);
    console.log(`  new_conversion: ${row.new_conversion} (raw value)`);
    console.log(`  returning_conversion: ${row.returning_conversion} (raw value)`);
  });
  
  // Check paid_ads
  console.log('\n\n📊 Paid Ads - CTR and Appointment Rate:');
  const { data: paidData } = await supabase
    .from('paid_ads')
    .select('month, campaign, ctr, appointment_rate')
    .eq('clinic', testClinic)
    .not('ctr', 'is', null)
    .order('month', { ascending: false })
    .limit(3);
  
  paidData?.forEach(row => {
    console.log(`\n${row.month} - ${row.campaign}:`);
    console.log(`  ctr: ${row.ctr} (raw value)`);
    console.log(`  appointment_rate: ${row.appointment_rate} (raw value)`);
  });
  
  // Check seo_channels
  console.log('\n\n📊 SEO Channels - CTR and Appointment Rate:');
  const { data: seoData } = await supabase
    .from('seo_channels')
    .select('month, traffic_source, ctr, appointment_rate')
    .eq('clinic', testClinic)
    .not('ctr', 'is', null)
    .order('month', { ascending: false })
    .limit(3);
  
  seoData?.forEach(row => {
    console.log(`\n${row.month} - ${row.traffic_source}:`);
    console.log(`  ctr: ${row.ctr} (raw value)`);
    console.log(`  appointment_rate: ${row.appointment_rate} (raw value)`);
  });
  
  console.log('\n\n' + '=' .repeat(60));
  console.log('\n📝 Interpretation:');
  console.log('- If values are < 1 (e.g., 0.85), they are stored as decimals');
  console.log('- If values are > 1 (e.g., 85), they are stored as percentages');
  console.log('\n⚠️  Based on what you see above, the formatting should be:');
  console.log('- Decimals: multiply by 100 and add %');
  console.log('- Percentages: just add .toFixed(1) and %');
}

checkPercentageFormat().catch(console.error);