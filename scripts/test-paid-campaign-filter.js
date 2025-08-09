const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPaidCampaignFilter() {
  console.log('🔍 Testing Paid Campaign Filter\n');
  console.log('=' .repeat(60));
  
  const testClinic = 'advancedlifeclinic.com';
  
  // Get all paid ads data
  const { data } = await supabase
    .from('paid_ads')
    .select('*')
    .eq('clinic', testClinic)
    .order('month', { ascending: false });
  
  if (!data || data.length === 0) {
    console.log('No paid ads data found');
    return;
  }
  
  // Get the most recent month
  const allMonths = [...new Set(data.map(row => row.month))].sort().reverse();
  const currentMonth = allMonths[0];
  
  console.log(`📅 Most recent month: ${new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n`);
  
  // Get all campaigns
  const allCampaigns = [...new Set(data.map(row => row.campaign))]
    .filter(campaign => campaign !== null && campaign !== undefined && campaign !== 'unknown campaign')
    .sort();
  
  console.log(`📊 Total campaigns: ${allCampaigns.length}`);
  
  // Filter campaigns with impressions > 1 in most recent month
  const recentMonthData = data.filter(row => row.month === currentMonth);
  const campaignsWithImpressions = recentMonthData
    .filter(row => row.impressions !== null && row.impressions > 1)
    .map(row => row.campaign)
    .filter(campaign => campaign !== null && campaign !== undefined && campaign !== 'unknown campaign');
  
  const filteredCampaigns = [...new Set(campaignsWithImpressions)].sort();
  
  console.log(`✅ Campaigns with impressions > 1 in ${new Date(currentMonth).toLocaleDateString('en-US', { month: 'short' })}: ${filteredCampaigns.length}\n`);
  
  // Show which campaigns will be hidden
  const hiddenCampaigns = allCampaigns.filter(campaign => !filteredCampaigns.includes(campaign));
  
  if (hiddenCampaigns.length > 0) {
    console.log('❌ Campaigns that will be hidden:');
    hiddenCampaigns.forEach(campaign => {
      const campaignData = recentMonthData.find(row => row.campaign === campaign);
      const impressions = campaignData ? campaignData.impressions : 'No data';
      console.log(`   - ${campaign} (impressions: ${impressions})`);
    });
  }
  
  console.log('\n✅ Campaigns that will be shown:');
  filteredCampaigns.forEach(campaign => {
    const campaignData = recentMonthData.find(row => row.campaign === campaign);
    const impressions = campaignData ? campaignData.impressions : 0;
    console.log(`   - ${campaign} (impressions: ${impressions})`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📝 Summary:');
  console.log(`- Filtering campaigns for: ${testClinic}`);
  console.log(`- Most recent month: ${new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  console.log(`- Campaigns shown: ${filteredCampaigns.length} of ${allCampaigns.length}`);
  console.log(`- Campaigns hidden: ${hiddenCampaigns.length}`);
}

testPaidCampaignFilter().catch(console.error);