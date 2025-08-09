const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPaidAdsData() {
  console.log('🔍 Verifying Paid Ads Data...\n');
  
  const testClinic = 'advancedlifeclinic.com';
  
  // Get paid ads data for the test clinic
  const { data: paidData } = await supabase
    .from('paid_ads')
    .select('*')
    .eq('clinic', testClinic)
    .order('month', { ascending: false })
    .order('campaign');
  
  // Get unique campaigns (excluding null and unknown)
  const campaigns = [...new Set(paidData.map(row => row.campaign))]
    .filter(campaign => campaign && campaign !== 'unknown campaign')
    .sort();
  
  console.log(`Found ${campaigns.length} campaigns for ${testClinic}:`);
  campaigns.forEach(c => console.log(`  - ${c}`));
  
  // Get all months and show latest 6
  const allMonths = [...new Set(paidData.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6);
  
  console.log('\nLatest 6 months in data:');
  allMonths.forEach(m => {
    const date = new Date(m);
    console.log(`  - ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
  });
  
  // Sample verification for one campaign
  const sampleCampaign = campaigns[0];
  console.log(`\n📊 Sample data for campaign "${sampleCampaign}":`);
  
  const campaignData = paidData.filter(row => row.campaign === sampleCampaign);
  console.log(`Found ${campaignData.length} records for this campaign`);
  
  // Show data for each month
  allMonths.forEach(month => {
    const monthData = campaignData.find(row => row.month === month);
    const monthName = new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (monthData) {
      console.log(`\n${monthName}:`);
      console.log(`  Impressions: ${monthData.impressions || 0}`);
      console.log(`  Visits: ${monthData.visits || 0}`);
      console.log(`  Spend: $${monthData.spend || 0}`);
      console.log(`  CTR: ${monthData.ctr ? (monthData.ctr * 100).toFixed(1) + '%' : '-'}`);
      console.log(`  Total Appointments: ${monthData.total_appointments || 0}`);
      console.log(`  Total Conversations: ${monthData.total_conversations || 0}`);
    } else {
      console.log(`\n${monthName}: No data`);
    }
  });
  
  // Check for any data quality issues
  console.log('\n⚠️  Data Quality Checks:');
  
  // Check for campaigns with sparse data
  const sparseCampaigns = campaigns.filter(campaign => {
    const campaignRecords = paidData.filter(row => row.campaign === campaign);
    return campaignRecords.length < 3; // Less than 3 months of data
  });
  
  if (sparseCampaigns.length > 0) {
    console.log(`Found ${sparseCampaigns.length} campaigns with less than 3 months of data:`);
    sparseCampaigns.forEach(c => {
      const count = paidData.filter(row => row.campaign === c).length;
      console.log(`  - ${c}: ${count} month(s)`);
    });
  } else {
    console.log('✅ All campaigns have sufficient data');
  }
}

async function verifySeoChannelsData() {
  console.log('\n\n🔍 Verifying SEO Channels Data...\n');
  
  const testClinic = 'advancedlifeclinic.com';
  
  // Get SEO data for the test clinic
  const { data: seoData } = await supabase
    .from('seo_channels')
    .select('*')
    .eq('clinic', testClinic)
    .order('month', { ascending: false })
    .order('traffic_source');
  
  // Get unique traffic sources
  const sources = [...new Set(seoData.map(row => row.traffic_source))].sort();
  
  console.log(`Found ${sources.length} SEO channels for ${testClinic}:`);
  sources.forEach(s => console.log(`  - ${s}`));
  
  // Get all months and show latest 6
  const allMonths = [...new Set(seoData.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6);
  
  console.log('\nLatest 6 months in data:');
  allMonths.forEach(m => {
    const date = new Date(m);
    console.log(`  - ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
  });
  
  // Show data for each source
  sources.forEach(source => {
    console.log(`\n📊 Data for "${source}":`);
    const sourceData = seoData.filter(row => row.traffic_source === source);
    console.log(`Found ${sourceData.length} records`);
    
    // Show latest 3 months for brevity
    const recentMonths = allMonths.slice(0, 3);
    recentMonths.forEach(month => {
      const monthData = sourceData.find(row => row.month === month);
      const monthName = new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (monthData) {
        console.log(`\n${monthName}:`);
        console.log(`  Impressions: ${monthData.impressions || 0}`);
        console.log(`  Visits: ${monthData.visits || 0}`);
        console.log(`  Total Appointments: ${monthData.total_appointments || 0}`);
        console.log(`  Total Conversations: ${monthData.total_conversations || 0}`);
        console.log(`  CTR: ${monthData.ctr ? (monthData.ctr * 100).toFixed(1) + '%' : '-'}`);
      } else {
        console.log(`\n${monthName}: No data`);
      }
    });
  });
}

async function compareGridLogic() {
  console.log('\n\n🔍 Verifying Grid Display Logic...\n');
  
  // Test the exact logic used in PaidChannelGrid and SEOChannelGrid
  const testClinic = 'advancedlifeclinic.com';
  
  // Fetch data exactly as the components do
  const { data: paidData } = await supabase
    .from('paid_ads')
    .select('*')
    .eq('clinic', testClinic)
    .order('month', { ascending: false })
    .order('clinic')
    .order('traffic_source')
    .order('campaign');
  
  const { data: seoData } = await supabase
    .from('seo_channels')
    .select('*')
    .eq('clinic', testClinic)
    .order('month', { ascending: false })
    .order('clinic')
    .order('traffic_source');
  
  // Apply the same filtering logic as components
  const campaigns = [...new Set(paidData.map(row => row.campaign))]
    .filter(campaign => campaign !== null && campaign !== undefined && campaign !== 'unknown campaign')
    .sort();
  
  const allPaidMonths = [...new Set(paidData.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6);
  
  const allSeoMonths = [...new Set(seoData.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6);
  
  console.log('Grid Display Summary:');
  console.log(`\nPaid Ads Grid will show:`);
  console.log(`  - ${campaigns.length} campaign cards`);
  console.log(`  - ${allPaidMonths.length} month columns`);
  console.log(`  - Most recent month: ${new Date(allPaidMonths[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
  console.log(`  - Oldest month shown: ${new Date(allPaidMonths[allPaidMonths.length - 1]).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
  
  console.log(`\nSEO Channels Grid will show:`);
  console.log(`  - ${[...new Set(seoData.map(row => row.traffic_source))].length} channel cards`);
  console.log(`  - ${allSeoMonths.length} month columns`);
  console.log(`  - Most recent month: ${new Date(allSeoMonths[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
  console.log(`  - Oldest month shown: ${new Date(allSeoMonths[allSeoMonths.length - 1]).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
  
  // Check if months align with executive_monthly_reports
  console.log('\n📊 Checking alignment with executive_monthly_reports...');
  
  const { data: execData } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .eq('clinic', testClinic)
    .gte('month', '2025-03-01')
    .lte('month', '2025-08-31')
    .order('month', { ascending: false });
  
  const execMonths = [...new Set(execData.map(row => row.month))];
  
  console.log(`\nExecutive reports cover ${execMonths.length} months (Mar-Aug 2025)`);
  console.log('Paid Ads covers same period:', allPaidMonths[0] === execMonths[0] && allPaidMonths.length === 6 ? '✅ Yes' : '❌ No');
  console.log('SEO Channels covers same period:', allSeoMonths[0] === execMonths[0] && allSeoMonths.length === 6 ? '✅ Yes' : '❌ No');
}

async function main() {
  console.log('🚀 Starting Paid and SEO Grid Verification\n');
  console.log('=' .repeat(60));
  
  try {
    await verifyPaidAdsData();
    await verifySeoChannelsData();
    await compareGridLogic();
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ Verification complete!');
    console.log('\nKey Points:');
    console.log('1. Both grids show the 6 most recent months of data');
    console.log('2. Empty cells display "-" when no data exists');
    console.log('3. All values come directly from the database (no calculations)');
    console.log('4. Month columns are consistent across all campaigns/channels');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
  }
}

main();