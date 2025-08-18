import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDataSync() {
  console.log('🔍 Verifying Data Sync Results');
  console.log('==============================\n');

  // Check executive_monthly_reports
  const { count: monthlyCount, error: monthlyError } = await supabase
    .from('executive_monthly_reports')
    .select('*', { count: 'exact', head: true });
  
  if (monthlyError) {
    console.error('Error checking executive_monthly_reports:', monthlyError);
  } else {
    console.log(`✅ executive_monthly_reports: ${monthlyCount} records (expected: 581)`);
  }

  // Check executive_weekly_reports - also check week 33 data
  const { count: weeklyCount, error: weeklyError } = await supabase
    .from('executive_weekly_reports')
    .select('*', { count: 'exact', head: true });
  
  if (weeklyError) {
    console.error('Error checking executive_weekly_reports:', weeklyError);
  } else {
    console.log(`✅ executive_weekly_reports: ${weeklyCount} records (expected: 2242)`);
  }

  // Check for week 33 data specifically (using date format)
  const { data: week33Data, error: week33Error } = await supabase
    .from('executive_weekly_reports')
    .select('clinic, week')
    .eq('week', '2025-08-17')  // Week 33 starts on Aug 17, 2025
    .limit(5);
  
  if (week33Error) {
    console.error('Error checking week 33:', week33Error);
  } else {
    console.log(`\n📅 Week 33 (2025-08-17) data check:`);
    if (week33Data && week33Data.length > 0) {
      console.log(`   Found ${week33Data.length} records for week 33`);
      console.log(`   Clinics: ${week33Data.map(d => d.clinic).join(', ')}`);
      console.log(`   ⚠️  Week 33 is incomplete and should NOT be displayed`);
    } else {
      console.log(`   No data found for week 33`);
    }
  }

  // Check latest complete week
  const { data: latestWeek, error: latestWeekError } = await supabase
    .from('executive_weekly_reports')
    .select('week')
    .order('week', { ascending: false })
    .limit(1);
  
  if (latestWeekError) {
    console.error('Error checking latest week:', latestWeekError);
  } else if (latestWeek && latestWeek[0]) {
    console.log(`\n📊 Latest week in database: ${latestWeek[0].week}`);
    console.log(`   Latest complete week should be: 2025-08-11 (week 32)`);
  }

  // Check paid_ads
  const { count: paidAdsCount, error: paidAdsError } = await supabase
    .from('paid_ads')
    .select('*', { count: 'exact', head: true });
  
  if (paidAdsError) {
    console.error('Error checking paid_ads:', paidAdsError);
  } else {
    console.log(`\n✅ paid_ads: ${paidAdsCount} records (expected: 813)`);
  }

  // Check seo_channels
  const { count: seoChannelsCount, error: seoChannelsError } = await supabase
    .from('seo_channels')
    .select('*', { count: 'exact', head: true });
  
  if (seoChannelsError) {
    console.error('Error checking seo_channels:', seoChannelsError);
  } else {
    console.log(`✅ seo_channels: ${seoChannelsCount} records (expected: 192)`);
  }

  // Check seo_highlights_keyword_page_one
  const { count: seoKeywordsCount, error: seoKeywordsError } = await supabase
    .from('seo_highlights_keyword_page_one')
    .select('*', { count: 'exact', head: true });
  
  if (seoKeywordsError) {
    console.error('Error checking seo_highlights_keyword_page_one:', seoKeywordsError);
  } else {
    console.log(`✅ seo_highlights_keyword_page_one: ${seoKeywordsCount} records (expected: 162)`);
  }

  console.log('\n✨ Data sync verification complete!');
}

// Run the verification
verifyDataSync().catch(console.error);