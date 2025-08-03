#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeJulyData() {
  console.log('JULY 2025 DATA ANALYSIS');
  console.log('========================\n');
  
  // Get all companies
  const { data: allData, error: allError } = await supabase
    .from('executive_monthly_reports')
    .select('clinic')
    .order('clinic');
  
  if (allError) {
    console.error('Error fetching companies:', allError);
    return;
  }
  
  const companies = [...new Set(allData.map(d => d.clinic))].sort();
  console.log(`Found ${companies.length} companies\n`);
  
  // Analyze July data for each company
  for (const company of companies) {
    console.log(`\n========================================`);
    console.log(`COMPANY: ${company}`);
    console.log(`========================================`);
    
    // Get July 2025 data
    const { data: julyData, error: julyError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .eq('clinic', company)
      .gte('month', '2025-07-01')
      .lte('month', '2025-07-31')
      .order('traffic_source');
    
    if (julyError) {
      console.error(`Error for ${company}:`, julyError);
      continue;
    }
    
    if (!julyData || julyData.length === 0) {
      console.log('NO JULY DATA FOUND');
      continue;
    }
    
    console.log(`\nJuly Records: ${julyData.length}`);
    
    // Calculate totals
    const totals = julyData.reduce((acc, row) => ({
      spend: acc.spend + (row.spend || 0),
      impressions: acc.impressions + (row.impressions || 0),
      visits: acc.visits + (row.visits || 0),
      leads: acc.leads + (row.leads || 0),
      new_leads: acc.new_leads + (row.new_leads || 0),
      returning_leads: acc.returning_leads + (row.returning_leads || 0),
      appointments: acc.appointments + (row.total_appointments || 0),
      revenue: acc.revenue + (row.total_estimated_revenue || 0),
      new_revenue: acc.new_revenue + (row.new_estimated_revenue || 0),
      returning_revenue: acc.returning_revenue + (row.returning_estimated_revenue || 0)
    }), {
      spend: 0,
      impressions: 0,
      visits: 0,
      leads: 0,
      new_leads: 0,
      returning_leads: 0,
      appointments: 0,
      revenue: 0,
      new_revenue: 0,
      returning_revenue: 0
    });
    
    console.log('\nJULY TOTALS:');
    console.log(`  Spend: $${totals.spend.toFixed(2)}`);
    console.log(`  Impressions: ${totals.impressions.toLocaleString()}`);
    console.log(`  Visits: ${totals.visits.toLocaleString()}`);
    console.log(`  Total Leads: ${totals.leads}`);
    console.log(`    - New Leads: ${totals.new_leads}`);
    console.log(`    - Returning Leads: ${totals.returning_leads}`);
    console.log(`  Appointments: ${totals.appointments}`);
    console.log(`  Total Revenue: $${totals.revenue.toFixed(2)}`);
    console.log(`    - New Revenue: $${totals.new_revenue.toFixed(2)}`);
    console.log(`    - Returning Revenue: $${totals.returning_revenue.toFixed(2)}`);
    
    // Calculate key metrics
    console.log('\nCALCULATED METRICS:');
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
    const conversionRate = totals.visits > 0 ? (totals.leads / totals.visits) * 100 : 0;
    const cac = totals.leads > 0 ? totals.spend / totals.leads : 0;
    const appointmentRate = totals.leads > 0 ? (totals.appointments / totals.leads) * 100 : 0;
    
    console.log(`  ROAS: ${roas.toFixed(2)}x`);
    console.log(`  Conversion Rate: ${conversionRate.toFixed(2)}%`);
    console.log(`  CAC: $${cac.toFixed(2)}`);
    console.log(`  Appointment Rate: ${appointmentRate.toFixed(2)}%`);
    
    // Show breakdown by channel
    console.log('\nBY CHANNEL:');
    const channels = {};
    julyData.forEach(row => {
      if (!channels[row.traffic_source]) {
        channels[row.traffic_source] = {
          spend: 0,
          leads: 0,
          visits: 0,
          revenue: 0,
          count: 0
        };
      }
      channels[row.traffic_source].spend += row.spend || 0;
      channels[row.traffic_source].leads += row.leads || 0;
      channels[row.traffic_source].visits += row.visits || 0;
      channels[row.traffic_source].revenue += row.total_estimated_revenue || 0;
      channels[row.traffic_source].count++;
    });
    
    Object.entries(channels).forEach(([channel, data]) => {
      const channelRoas = data.spend > 0 ? data.revenue / data.spend : 0;
      console.log(`\n  ${channel}:`);
      console.log(`    Records: ${data.count}`);
      console.log(`    Spend: $${data.spend.toFixed(2)}`);
      console.log(`    Leads: ${data.leads}`);
      console.log(`    Visits: ${data.visits}`);
      console.log(`    Revenue: $${data.revenue.toFixed(2)}`);
      console.log(`    ROAS: ${channelRoas.toFixed(2)}x`);
    });
    
    // Check for data anomalies
    console.log('\nDATA QUALITY CHECKS:');
    const zeroSpendChannels = julyData.filter(d => !d.spend || d.spend === 0);
    const zeroLeadChannels = julyData.filter(d => !d.leads || d.leads === 0);
    const highRoasChannels = julyData.filter(d => {
      const roas = d.spend > 0 ? (d.total_estimated_revenue / d.spend) : 0;
      return roas > 10;
    });
    
    console.log(`  Channels with $0 spend: ${zeroSpendChannels.length}/${julyData.length}`);
    if (zeroSpendChannels.length > 0) {
      console.log(`    - ${zeroSpendChannels.map(d => d.traffic_source).join(', ')}`);
    }
    console.log(`  Channels with 0 leads: ${zeroLeadChannels.length}/${julyData.length}`);
    console.log(`  Channels with ROAS > 10x: ${highRoasChannels.length}`);
    
    // Compare with June if available
    const { data: juneData } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .eq('clinic', company)
      .gte('month', '2025-06-01')
      .lte('month', '2025-06-30');
    
    if (juneData && juneData.length > 0) {
      const juneTotals = juneData.reduce((acc, row) => ({
        spend: acc.spend + (row.spend || 0),
        leads: acc.leads + (row.leads || 0),
        revenue: acc.revenue + (row.total_estimated_revenue || 0)
      }), { spend: 0, leads: 0, revenue: 0 });
      
      console.log('\nJUNE VS JULY COMPARISON:');
      console.log(`  June Spend: $${juneTotals.spend.toFixed(2)} → July: $${totals.spend.toFixed(2)} (${((totals.spend - juneTotals.spend) / juneTotals.spend * 100).toFixed(1)}%)`);
      console.log(`  June Leads: ${juneTotals.leads} → July: ${totals.leads} (${((totals.leads - juneTotals.leads) / juneTotals.leads * 100).toFixed(1)}%)`);
      console.log(`  June Revenue: $${juneTotals.revenue.toFixed(2)} → July: $${totals.revenue.toFixed(2)} (${((totals.revenue - juneTotals.revenue) / juneTotals.revenue * 100).toFixed(1)}%)`);
    }
  }
  
  // Summary across all companies
  console.log('\n\n========================================');
  console.log('JULY 2025 SUMMARY ACROSS ALL COMPANIES');
  console.log('========================================\n');
  
  const { data: allJulyData } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .gte('month', '2025-07-01')
    .lte('month', '2025-07-31');
  
  if (allJulyData) {
    const grandTotals = allJulyData.reduce((acc, row) => ({
      spend: acc.spend + (row.spend || 0),
      leads: acc.leads + (row.leads || 0),
      revenue: acc.revenue + (row.total_estimated_revenue || 0),
      visits: acc.visits + (row.visits || 0)
    }), { spend: 0, leads: 0, revenue: 0, visits: 0 });
    
    console.log('GRAND TOTALS:');
    console.log(`  Total Records: ${allJulyData.length}`);
    console.log(`  Total Spend: $${grandTotals.spend.toFixed(2)}`);
    console.log(`  Total Leads: ${grandTotals.leads}`);
    console.log(`  Total Revenue: $${grandTotals.revenue.toFixed(2)}`);
    console.log(`  Total Visits: ${grandTotals.visits.toLocaleString()}`);
    console.log(`  Overall ROAS: ${(grandTotals.revenue / grandTotals.spend).toFixed(2)}x`);
    console.log(`  Overall CAC: $${(grandTotals.spend / grandTotals.leads).toFixed(2)}`);
    console.log(`  Overall Conversion: ${(grandTotals.leads / grandTotals.visits * 100).toFixed(2)}%`);
  }
}

analyzeJulyData().catch(console.error);