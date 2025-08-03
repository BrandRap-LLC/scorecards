#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyDashboardCalculations() {
  console.log('VERIFYING DASHBOARD JULY CALCULATIONS');
  console.log('=====================================\n');
  
  // Test with a specific company
  const testCompany = 'advancedlifeclinic.com';
  
  console.log(`Testing with: ${testCompany}\n`);
  
  // Fetch exactly as dashboard does for July
  const endDate = new Date('2025-08-31');
  const startDate = new Date('2025-04-01');
  
  const { data: allData, error } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', testCompany)
    .gte('month', '2025-04-01')
    .lte('month', '2025-08-31')
    .order('month', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total records fetched: ${allData.length}\n`);
  
  // Filter July data specifically
  const julyData = allData.filter(d => d.month.startsWith('2025-07'));
  console.log(`July records: ${julyData.length}\n`);
  
  // Dashboard calculation method
  console.log('DASHBOARD CALCULATION METHOD:');
  console.log('-----------------------------');
  
  const monthlyGroups = allData.reduce((acc, row) => {
    const month = row.month.substring(0, 7);
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(row);
    return acc;
  }, {});
  
  // Process July data as dashboard does
  const julyRows = monthlyGroups['2025-07'];
  if (julyRows) {
    const totals = julyRows.reduce((acc, row) => ({
      spend: acc.spend + (row.spend || 0),
      leads: acc.leads + (row.leads || 0),
      visits: acc.visits + (row.visits || 0),
      impressions: acc.impressions + (row.impressions || 0),
      appointments: acc.appointments + (row.total_appointments || 0),
      revenue: acc.revenue + (row.total_estimated_revenue || 0),
      roasSum: acc.roasSum + (row.total_roas || row.roas || 0),
      conversionSum: acc.conversionSum + (row.total_conversion || row.conversion_rate || 0),
      count: acc.count + 1
    }), {
      spend: 0,
      leads: 0,
      visits: 0,
      impressions: 0,
      appointments: 0,
      revenue: 0,
      roasSum: 0,
      conversionSum: 0,
      count: 0
    });
    
    // Calculate ROAS as dashboard does
    const calculatedROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;
    const avgConversion = totals.visits > 0 ? (totals.leads / totals.visits) * 100 : 0;
    const avgCAC = totals.leads > 0 ? totals.spend / totals.leads : 0;
    
    console.log('July Dashboard Calculations:');
    console.log(`  Spend: $${totals.spend.toFixed(2)}`);
    console.log(`  Leads: ${totals.leads}`);
    console.log(`  Visits: ${totals.visits}`);
    console.log(`  Revenue: $${totals.revenue.toFixed(2)}`);
    console.log(`  Appointments: ${totals.appointments}`);
    console.log(`  Calculated ROAS: ${calculatedROAS.toFixed(2)}x`);
    console.log(`  Calculated Conversion: ${avgConversion.toFixed(2)}%`);
    console.log(`  Calculated CAC: $${avgCAC.toFixed(2)}`);
  }
  
  // Direct calculation
  console.log('\n\nDIRECT JULY CALCULATION:');
  console.log('------------------------');
  
  const directTotals = julyData.reduce((acc, row) => ({
    spend: acc.spend + (row.spend || 0),
    leads: acc.leads + (row.leads || 0),
    visits: acc.visits + (row.visits || 0),
    revenue: acc.revenue + (row.total_estimated_revenue || 0),
    appointments: acc.appointments + (row.total_appointments || 0)
  }), {
    spend: 0,
    leads: 0,
    visits: 0,
    revenue: 0,
    appointments: 0
  });
  
  console.log(`  Spend: $${directTotals.spend.toFixed(2)}`);
  console.log(`  Leads: ${directTotals.leads}`);
  console.log(`  Visits: ${directTotals.visits}`);
  console.log(`  Revenue: $${directTotals.revenue.toFixed(2)}`);
  console.log(`  Appointments: ${directTotals.appointments}`);
  console.log(`  ROAS: ${(directTotals.revenue / directTotals.spend).toFixed(2)}x`);
  console.log(`  Conversion: ${(directTotals.leads / directTotals.visits * 100).toFixed(2)}%`);
  console.log(`  CAC: $${(directTotals.spend / directTotals.leads).toFixed(2)}`);
  
  // Check individual channel ROAS values
  console.log('\n\nINDIVIDUAL CHANNEL ROAS VALUES IN JULY:');
  console.log('----------------------------------------');
  
  julyData.forEach(row => {
    const channelROAS = row.spend > 0 ? row.total_estimated_revenue / row.spend : 0;
    console.log(`${row.traffic_source}:`);
    console.log(`  Spend: $${row.spend}`);
    console.log(`  Revenue: $${row.total_estimated_revenue}`);
    console.log(`  Stored ROAS: ${row.roas}`);
    console.log(`  Stored Total ROAS: ${row.total_roas}`);
    console.log(`  Calculated ROAS: ${channelROAS.toFixed(2)}x`);
    console.log(`  Match: ${Math.abs(channelROAS - (row.total_roas || row.roas || 0)) < 0.01 ? '✓' : '✗'}`);
    console.log('');
  });
  
  // Check if issue is with ROAS values in database
  console.log('\nPOSSIBLE ISSUES:');
  console.log('----------------');
  
  const highROASChannels = julyData.filter(row => {
    const calcROAS = row.spend > 0 ? row.total_estimated_revenue / row.spend : 0;
    return calcROAS > 50;
  });
  
  if (highROASChannels.length > 0) {
    console.log(`Found ${highROASChannels.length} channels with extremely high ROAS (>50x):`);
    highROASChannels.forEach(row => {
      const calcROAS = row.spend > 0 ? row.total_estimated_revenue / row.spend : 0;
      console.log(`  - ${row.traffic_source}: ${calcROAS.toFixed(2)}x (Spend: $${row.spend}, Revenue: $${row.total_estimated_revenue})`);
    });
  }
  
  const zeroSpendHighRevenue = julyData.filter(row => 
    row.spend === 0 && row.total_estimated_revenue > 0
  );
  
  if (zeroSpendHighRevenue.length > 0) {
    console.log(`\nFound ${zeroSpendHighRevenue.length} channels with $0 spend but revenue:`);
    zeroSpendHighRevenue.forEach(row => {
      console.log(`  - ${row.traffic_source}: Revenue: $${row.total_estimated_revenue}`);
    });
  }
}

verifyDashboardCalculations().catch(console.error);