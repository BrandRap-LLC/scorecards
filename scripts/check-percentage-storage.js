const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPercentageStorage() {
  console.log('🔍 Checking How Percentages Are Stored\n');
  console.log('=' .repeat(60));
  
  // Check executive_monthly_reports
  console.log('\n1️⃣ EXECUTIVE MONTHLY REPORTS:');
  const { data: execData } = await supabase
    .from('executive_monthly_reports')
    .select('clinic, traffic_source, total_conversion, new_conversion')
    .gt('total_conversion', 0)
    .order('total_conversion', { ascending: false })
    .limit(5);
  
  if (execData && execData.length > 0) {
    execData.forEach(row => {
      console.log(`\n${row.clinic} - ${row.traffic_source}:`);
      console.log(`  total_conversion: ${row.total_conversion}`);
      console.log(`  new_conversion: ${row.new_conversion}`);
    });
  } else {
    console.log('  No non-zero conversion rates found');
  }
  
  // Check a specific clinic with known data
  console.log('\n\n2️⃣ PAID ADS - CTR VALUES:');
  const { data: paidCtr } = await supabase
    .from('paid_ads')
    .select('clinic, campaign, ctr, appointment_rate')
    .gt('ctr', 0)
    .order('ctr', { ascending: false })
    .limit(5);
  
  if (paidCtr && paidCtr.length > 0) {
    paidCtr.forEach(row => {
      console.log(`\n${row.clinic} - ${row.campaign}:`);
      console.log(`  ctr: ${row.ctr}`);
      console.log(`  appointment_rate: ${row.appointment_rate}`);
      
      // Show how they would display with different formatting
      console.log(`  → If decimal: ${(row.ctr * 100).toFixed(1)}%`);
      console.log(`  → If percentage: ${row.ctr.toFixed(1)}%`);
    });
  }
  
  console.log('\n\n' + '=' .repeat(60));
  console.log('\n📊 ANALYSIS:');
  console.log('Based on the data above:');
  console.log('- CTR values appear to be stored as decimals (need × 100)');
  console.log('- Conversion rates might be stored differently');
  console.log('\n⚠️  Current Status:');
  console.log('- PaidChannelGrid & SEOChannelGrid: Fixed to NOT multiply by 100');
  console.log('- Other grids: Already treating as percentages');
}

checkPercentageStorage().catch(console.error);