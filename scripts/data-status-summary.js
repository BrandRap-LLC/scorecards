const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateDataStatusSummary() {
  console.log('=' . repeat(80));
  console.log('                         SCORECARDS DATA STATUS SUMMARY');
  console.log('=' . repeat(80));
  console.log(`Generated on: ${new Date().toLocaleString()}\n`);
  
  const tables = [
    'executive_monthly_reports',
    'executive_weekly_reports',
    'paid_ads',
    'seo_channels',
    'seo_highlights_keyword_page_one',
    'ceo_metrics',
    'ceo_metrics_weekly'
  ];
  
  for (const table of tables) {
    console.log(`\n📊 ${table.toUpperCase()}`);
    console.log('-' . repeat(60));
    
    try {
      // Get record count
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`Total Records: ${count?.toLocaleString() || '0'}`);
      
      // Get date range based on table
      let dateField = 'created_at';
      if (table.includes('monthly') || table === 'paid_ads' || table === 'seo_channels') {
        dateField = 'month';
      } else if (table.includes('weekly')) {
        dateField = 'week';
      } else if (table === 'seo_highlights_keyword_page_one') {
        dateField = 'period';
      }
      
      // Get latest and earliest dates
      const { data: latestData } = await supabase
        .from(table)
        .select(dateField)
        .order(dateField, { ascending: false })
        .limit(1);
      
      const { data: earliestData } = await supabase
        .from(table)
        .select(dateField)
        .order(dateField, { ascending: true })
        .limit(1);
      
      if (latestData?.length > 0 && earliestData?.length > 0) {
        console.log(`Date Range: ${earliestData[0][dateField]} to ${latestData[0][dateField]}`);
      }
      
      // Get unique clinics/companies
      if (table !== 'seo_highlights_keyword_page_one') {
        const { data: clinicsData } = await supabase
          .from(table)
          .select('clinic')
          .limit(1000);
        
        const uniqueClinics = [...new Set(clinicsData?.map(d => d.clinic) || [])];
        console.log(`Unique Clinics: ${uniqueClinics.length}`);
        
        if (uniqueClinics.length <= 15) {
          console.log(`Clinics: ${uniqueClinics.sort().join(', ')}`);
        }
      } else {
        const { data: companiesData } = await supabase
          .from(table)
          .select('company_name')
          .limit(1000);
        
        const uniqueCompanies = [...new Set(companiesData?.map(d => d.company_name) || [])];
        console.log(`Unique Companies: ${uniqueCompanies.length}`);
      }
      
      // Special checks for specific tables
      if (table === 'executive_monthly_reports' || table === 'executive_weekly_reports') {
        const { data: trafficData } = await supabase
          .from(table)
          .select('traffic_source')
          .limit(1000);
        
        const uniqueTrafficSources = [...new Set(trafficData?.map(d => d.traffic_source) || [])];
        console.log(`Traffic Sources: ${uniqueTrafficSources.sort().join(', ')}`);
      }
      
      if (table === 'paid_ads') {
        const { data: recentSpend } = await supabase
          .from(table)
          .select('month, spend')
          .eq('month', latestData?.[0]?.month)
          .order('spend', { ascending: false })
          .limit(1);
        
        if (recentSpend?.length > 0) {
          const totalSpend = recentSpend.reduce((sum, r) => sum + (r.spend || 0), 0);
          console.log(`Latest Month Total Spend: $${totalSpend.toLocaleString()}`);
        }
      }
      
    } catch (error) {
      console.log(`Error accessing table: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' . repeat(80));
  console.log('                              SYNC SCRIPTS AVAILABLE');
  console.log('=' . repeat(80));
  console.log('\n1. Sync all data (monthly/weekly executive reports + paid/SEO):');
  console.log('   node scripts/sync-mssql-to-supabase.js');
  console.log('\n2. Sync specific tables:');
  console.log('   node scripts/sync-mssql-to-supabase.js --table=executiveMonthly');
  console.log('   node scripts/sync-mssql-to-supabase.js --table=executiveWeekly');
  console.log('\n3. Sync paid ads and SEO data:');
  console.log('   node scripts/sync-all-data.js');
  console.log('\n4. Check data status:');
  console.log('   node scripts/data-status-summary.js');
  console.log('\n' + '=' . repeat(80));
}

generateDataStatusSummary().catch(console.error);