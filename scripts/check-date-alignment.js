const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDateAlignment() {
  const testClinic = 'advancedlifeclinic.com';
  
  console.log('🗓️  Checking Date Alignment\n');
  
  // Get executive monthly reports dates
  const { data: execData } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .eq('clinic', testClinic)
    .order('month', { ascending: false });
  
  const execMonths = [...new Set(execData.map(row => row.month))];
  console.log('Executive Monthly Reports months:');
  execMonths.slice(0, 6).forEach(m => {
    console.log(`  - ${m} (${new Date(m).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`);
  });
  
  // Get paid ads dates
  const { data: paidData } = await supabase
    .from('paid_ads')
    .select('month')
    .eq('clinic', testClinic)
    .order('month', { ascending: false });
  
  const paidMonths = [...new Set(paidData.map(row => row.month))];
  console.log('\nPaid Ads months:');
  paidMonths.slice(0, 6).forEach(m => {
    console.log(`  - ${m} (${new Date(m).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`);
  });
  
  // Get SEO channels dates
  const { data: seoData } = await supabase
    .from('seo_channels')
    .select('month')
    .eq('clinic', testClinic)
    .order('month', { ascending: false });
  
  const seoMonths = [...new Set(seoData.map(row => row.month))];
  console.log('\nSEO Channels months:');
  seoMonths.slice(0, 6).forEach(m => {
    console.log(`  - ${m} (${new Date(m).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`);
  });
  
  // Check alignment
  console.log('\n📊 Alignment Check:');
  console.log('Executive latest:', execMonths[0]);
  console.log('Paid Ads latest:', paidMonths[0]);
  console.log('SEO latest:', seoMonths[0]);
  
  // Check specific values
  console.log('\n🔍 Detailed Check for one campaign:');
  const { data: sampleData } = await supabase
    .from('paid_ads')
    .select('*')
    .eq('clinic', testClinic)
    .eq('campaign', 'BR_ALC_Brand')
    .order('month', { ascending: false })
    .limit(3);
  
  console.log('\nBR_ALC_Brand campaign recent data:');
  sampleData.forEach(record => {
    console.log(`\n${new Date(record.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}:`);
    console.log(`  Impressions: ${record.impressions}`);
    console.log(`  Visits: ${record.visits}`);
    console.log(`  Spend: $${record.spend}`);
    console.log(`  CTR: ${record.ctr ? (record.ctr * 100).toFixed(1) + '%' : 'null'}`);
  });
}

checkDateAlignment().catch(console.error);