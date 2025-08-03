#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGridDisplay() {
  // Fetch exactly what the dashboard fetches
  const { data } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', 'advancedlifeclinic.com')
    .gte('month', '2025-03-01')
    .lte('month', '2025-07-31')
    .order('month', { ascending: true });
  
  console.log('GRID DISPLAY TEST');
  console.log('=================\n');
  
  // Mimic the grid grouping logic
  const monthlyData = {};
  
  data.forEach(row => {
    const month = row.month.substring(0, 7); // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = {
        impressions: 0,
        visits: 0,
        leads: 0,
        spend: 0,
        total_estimated_revenue: 0,
        count: 0
      };
    }
    
    monthlyData[month].impressions += row.impressions || 0;
    monthlyData[month].visits += row.visits || 0;
    monthlyData[month].leads += row.leads || 0;
    monthlyData[month].spend += row.spend || 0;
    monthlyData[month].total_estimated_revenue += row.total_estimated_revenue || 0;
    monthlyData[month].count++;
  });
  
  // Get sorted months (exactly as grid does)
  const months = Object.keys(monthlyData).sort();
  
  console.log('Grid will show these columns:');
  months.forEach(month => {
    const date = new Date(month + '-01');
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    console.log(`  ${monthName} ${year} (${month})`);
  });
  
  console.log('\nSample data for each month:');
  months.forEach(month => {
    console.log(`\n${month}:`);
    console.log(`  Impressions: ${monthlyData[month].impressions.toLocaleString()}`);
    console.log(`  Visits: ${monthlyData[month].visits.toLocaleString()}`);
    console.log(`  Leads: ${monthlyData[month].leads}`);
    console.log(`  Spend: $${monthlyData[month].spend.toFixed(2)}`);
    console.log(`  Revenue: $${monthlyData[month].total_estimated_revenue.toFixed(2)}`);
  });
  
  console.log('\n✓ All 5 months including July 2025 should be displayed');
}

testGridDisplay().catch(console.error);