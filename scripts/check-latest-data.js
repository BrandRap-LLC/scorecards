const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLatestData() {
  console.log('Checking latest data in Supabase tables...\n');

  // Check executive_monthly_reports
  const { data: monthlyData, error: monthlyError } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);

  if (!monthlyError && monthlyData?.length > 0) {
    console.log('executive_monthly_reports:');
    console.log(`  Latest month: ${monthlyData[0].month}`);
    
    const { count: monthlyCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${monthlyCount}\n`);
  }

  // Check executive_weekly_reports
  const { data: weeklyData, error: weeklyError } = await supabase
    .from('executive_weekly_reports')
    .select('week')
    .order('week', { ascending: false })
    .limit(1);

  if (!weeklyError && weeklyData?.length > 0) {
    console.log('executive_weekly_reports:');
    console.log(`  Latest week: ${weeklyData[0].week}`);
    
    const { count: weeklyCount } = await supabase
      .from('executive_weekly_reports')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${weeklyCount}\n`);
  }

  // Check paid_ads
  const { data: paidAdsData, error: paidAdsError } = await supabase
    .from('paid_ads')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);

  if (!paidAdsError && paidAdsData?.length > 0) {
    console.log('paid_ads:');
    console.log(`  Latest date: ${paidAdsData[0].date}`);
    
    const { count: paidAdsCount } = await supabase
      .from('paid_ads')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${paidAdsCount}\n`);
  }

  // Check seo_channels
  const { data: seoChannelsData, error: seoChannelsError } = await supabase
    .from('seo_channels')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);

  if (!seoChannelsError && seoChannelsData?.length > 0) {
    console.log('seo_channels:');
    console.log(`  Latest date: ${seoChannelsData[0].date}`);
    
    const { count: seoChannelsCount } = await supabase
      .from('seo_channels')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${seoChannelsCount}\n`);
  }

  // Check seo_highlights_keyword_page_one
  const { data: seoKeywordsData, error: seoKeywordsError } = await supabase
    .from('seo_highlights_keyword_page_one')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);

  if (!seoKeywordsError && seoKeywordsData?.length > 0) {
    console.log('seo_highlights_keyword_page_one:');
    console.log(`  Latest date: ${seoKeywordsData[0].date}`);
    
    const { count: seoKeywordsCount } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${seoKeywordsCount}\n`);
  }

  // Check CEO metrics tables
  const { data: ceoMonthlyData, error: ceoMonthlyError } = await supabase
    .from('ceo_metrics')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);

  if (!ceoMonthlyError && ceoMonthlyData?.length > 0) {
    console.log('ceo_metrics:');
    console.log(`  Latest month: ${ceoMonthlyData[0].month}`);
    
    const { count: ceoMonthlyCount } = await supabase
      .from('ceo_metrics')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${ceoMonthlyCount}\n`);
  }

  const { data: ceoWeeklyData, error: ceoWeeklyError } = await supabase
    .from('ceo_metrics_weekly')
    .select('week')
    .order('week', { ascending: false })
    .limit(1);

  if (!ceoWeeklyError && ceoWeeklyData?.length > 0) {
    console.log('ceo_metrics_weekly:');
    console.log(`  Latest week: ${ceoWeeklyData[0].week}`);
    
    const { count: ceoWeeklyCount } = await supabase
      .from('ceo_metrics_weekly')
      .select('*', { count: 'exact', head: true });
    console.log(`  Total records: ${ceoWeeklyCount}\n`);
  }
}

checkLatestData().catch(console.error);