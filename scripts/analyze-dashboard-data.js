#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeData() {
  // Test with a specific company
  const company = 'advancedlifeclinic.com';
  
  console.log('Analyzing data for:', company);
  console.log('=====================================\n');
  
  // Get last 5 months of data
  const endDate = new Date('2025-08-31');
  const startDate = new Date('2025-04-01');
  
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', company)
    .gte('month', '2025-04-01')
    .lte('month', '2025-08-31')
    .order('month', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total records found:', data.length);
  
  // Show sample record structure
  if (data.length > 0) {
    console.log('\nSample record (first record):');
    console.log('-------------------------------');
    const sample = data[0];
    console.log('Month:', sample.month);
    console.log('Traffic Source:', sample.traffic_source);
    console.log('Spend:', sample.spend);
    console.log('Leads:', sample.leads);
    console.log('ROAS:', sample.roas, '/ Total ROAS:', sample.total_roas);
    console.log('Conversion:', sample.conversion_rate, '/ Total Conv:', sample.total_conversion);
    console.log('Impressions:', sample.impressions);
    console.log('Visits:', sample.visits);
    console.log('Appointments:', sample.total_appointments);
    console.log('Revenue:', sample.total_estimated_revenue);
    console.log('New Revenue:', sample.new_estimated_revenue);
    console.log('CAC Total:', sample.cac_total);
    console.log('CAC New:', sample.cac_new);
    console.log('New Leads:', sample.new_leads);
    console.log('Returning Leads:', sample.returning_leads);
  }
  
  // Group by month to see monthly totals
  console.log('\nMonthly Summary:');
  console.log('-----------------');
  const monthlyData = {};
  
  data.forEach(record => {
    const month = record.month.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = {
        spend: 0,
        leads: 0,
        visits: 0,
        revenue: 0,
        impressions: 0,
        appointments: 0,
        records: 0,
        roasSum: 0,
        conversionSum: 0
      };
    }
    monthlyData[month].spend += record.spend || 0;
    monthlyData[month].leads += record.leads || 0;
    monthlyData[month].visits += record.visits || 0;
    monthlyData[month].revenue += record.total_estimated_revenue || 0;
    monthlyData[month].impressions += record.impressions || 0;
    monthlyData[month].appointments += record.total_appointments || 0;
    monthlyData[month].roasSum += record.total_roas || record.roas || 0;
    monthlyData[month].conversionSum += record.total_conversion || record.conversion_rate || 0;
    monthlyData[month].records++;
  });
  
  Object.entries(monthlyData).forEach(([month, data]) => {
    console.log(`\n${month}:`);
    console.log(`  Records: ${data.records}`);
    console.log(`  Spend: $${data.spend.toFixed(2)}`);
    console.log(`  Leads: ${data.leads}`);
    console.log(`  Visits: ${data.visits}`);
    console.log(`  Impressions: ${data.impressions}`);
    console.log(`  Revenue: $${data.revenue.toFixed(2)}`);
    console.log(`  Appointments: ${data.appointments}`);
    console.log(`  Avg ROAS: ${(data.roasSum / data.records).toFixed(2)}`);
    console.log(`  Avg Conversion: ${(data.conversionSum / data.records).toFixed(2)}%`);
    console.log(`  CAC: $${data.leads > 0 ? (data.spend / data.leads).toFixed(2) : 'N/A'}`);
  });
  
  // Check traffic sources
  console.log('\nTraffic Sources in Data:');
  console.log('-------------------------');
  const sources = [...new Set(data.map(d => d.traffic_source))];
  sources.forEach(source => {
    const sourceData = data.filter(d => d.traffic_source === source);
    const totalSpend = sourceData.reduce((sum, d) => sum + (d.spend || 0), 0);
    const totalLeads = sourceData.reduce((sum, d) => sum + (d.leads || 0), 0);
    const totalRevenue = sourceData.reduce((sum, d) => sum + (d.total_estimated_revenue || 0), 0);
    console.log(`\n${source}:`);
    console.log(`  Records: ${sourceData.length}`);
    console.log(`  Total Spend: $${totalSpend.toFixed(2)}`);
    console.log(`  Total Leads: ${totalLeads}`);
    console.log(`  Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`  Overall ROAS: ${totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 'N/A'}`);
  });
  
  // Check for data issues
  console.log('\n\nData Quality Check:');
  console.log('--------------------');
  const nullSpend = data.filter(d => !d.spend || d.spend === 0).length;
  const nullLeads = data.filter(d => !d.leads || d.leads === 0).length;
  const nullRevenue = data.filter(d => !d.total_estimated_revenue).length;
  
  console.log(`Records with 0 or null spend: ${nullSpend}/${data.length}`);
  console.log(`Records with 0 or null leads: ${nullLeads}/${data.length}`);
  console.log(`Records with null revenue: ${nullRevenue}/${data.length}`);
  
  // Check August data specifically
  const augustData = data.filter(d => d.month.startsWith('2025-08'));
  console.log(`\nAugust 2025 Data: ${augustData.length} records`);
  if (augustData.length > 0) {
    const augustTotals = augustData.reduce((acc, d) => ({
      spend: acc.spend + (d.spend || 0),
      leads: acc.leads + (d.leads || 0),
      revenue: acc.revenue + (d.total_estimated_revenue || 0)
    }), { spend: 0, leads: 0, revenue: 0 });
    
    console.log(`August Totals:`);
    console.log(`  Spend: $${augustTotals.spend.toFixed(2)}`);
    console.log(`  Leads: ${augustTotals.leads}`);
    console.log(`  Revenue: $${augustTotals.revenue.toFixed(2)}`);
  }
}

analyzeData().catch(console.error);