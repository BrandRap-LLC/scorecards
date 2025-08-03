#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGridData() {
  // Check what data the dashboard fetches
  const { data } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', 'advancedlifeclinic.com')
    .gte('month', '2025-03-01')
    .lte('month', '2025-07-31')
    .order('month');
  
  // Group by month
  const months = {};
  data.forEach(row => {
    const month = row.month.substring(0, 7);
    if (!months[month]) {
      months[month] = { 
        count: 0, 
        leads: 0, 
        spend: 0, 
        revenue: 0,
        impressions: 0,
        visits: 0
      };
    }
    months[month].count++;
    months[month].leads += row.leads || 0;
    months[month].spend += row.spend || 0;
    months[month].revenue += row.total_estimated_revenue || 0;
    months[month].impressions += row.impressions || 0;
    months[month].visits += row.visits || 0;
  });
  
  console.log('DATA FETCHED BY DASHBOARD:');
  console.log('===========================\n');
  console.log('Query: 2025-03-01 to 2025-07-31');
  console.log('Total records:', data.length);
  console.log('\nBY MONTH:');
  Object.entries(months).forEach(([month, monthData]) => {
    console.log(`\n${month}:`);
    console.log(`  Records: ${monthData.count}`);
    console.log(`  Leads: ${monthData.leads}`);
    console.log(`  Spend: $${monthData.spend.toFixed(2)}`);
    console.log(`  Revenue: $${monthData.revenue.toFixed(2)}`);
    console.log(`  Impressions: ${monthData.impressions}`);
    console.log(`  Visits: ${monthData.visits}`);
  });
  
  // Check July specifically
  const julyData = data.filter(d => d.month.startsWith('2025-07'));
  console.log('\n\nJULY 2025 SPECIFIC CHECK:');
  console.log('=========================');
  console.log('July records found:', julyData.length);
  if (julyData.length > 0) {
    console.log('First July record:', {
      month: julyData[0].month,
      traffic_source: julyData[0].traffic_source,
      leads: julyData[0].leads,
      spend: julyData[0].spend
    });
  }
}

checkGridData().catch(console.error);