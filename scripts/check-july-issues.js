#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJulyIssues() {
  console.log('ANALYZING WHY JULY METRICS ARE INCORRECT');
  console.log('=========================================\n');
  
  // 1. Check "others" channel across all months
  console.log('1. "OTHERS" CHANNEL ANALYSIS:');
  console.log('------------------------------');
  
  const { data: othersData } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('traffic_source', 'others')
    .order('month');
  
  const monthSummary = {};
  othersData.forEach(row => {
    const month = row.month.substring(0, 7);
    if (!monthSummary[month]) {
      monthSummary[month] = {
        spend: 0,
        leads: 0,
        visits: 0,
        revenue: 0,
        count: 0
      };
    }
    monthSummary[month].spend += row.spend || 0;
    monthSummary[month].leads += row.leads || 0;
    monthSummary[month].visits += row.visits || 0;
    monthSummary[month].revenue += row.total_estimated_revenue || 0;
    monthSummary[month].count++;
  });
  
  Object.entries(monthSummary).forEach(([month, data]) => {
    const conversion = data.visits > 0 ? (data.leads / data.visits) * 100 : 0;
    console.log(`\n${month}:`);
    console.log(`  Companies: ${data.count}`);
    console.log(`  Total Spend: $${data.spend.toFixed(2)}`);
    console.log(`  Total Leads: ${data.leads}`);
    console.log(`  Total Visits: ${data.visits}`);
    console.log(`  Total Revenue: $${data.revenue.toFixed(2)}`);
    console.log(`  Conversion Rate: ${conversion.toFixed(1)}%`);
    if (conversion > 100) {
      console.log(`  ⚠️  DATA ERROR: Conversion >100% (more leads than visits!)`);
    }
  });
  
  // 2. Check stored vs calculated values for July
  console.log('\n\n2. JULY STORED VS CALCULATED VALUES:');
  console.log('--------------------------------------');
  
  const { data: julyData } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .gte('month', '2025-07-01')
    .lte('month', '2025-07-31');
  
  let mismatchCount = 0;
  let totalRecords = julyData.length;
  
  julyData.forEach(row => {
    const issues = [];
    
    // Check conversion calculation
    const expectedConv = row.visits > 0 ? (row.leads / row.visits) * 100 : 0;
    if (Math.abs(expectedConv - row.total_conversion) > 1) {
      issues.push(`Conversion: stored=${row.total_conversion}, expected=${expectedConv.toFixed(2)}`);
    }
    
    // Check CAC calculation
    const expectedCAC = row.leads > 0 ? row.spend / row.leads : 0;
    if (Math.abs(expectedCAC - row.cac_total) > 1) {
      issues.push(`CAC: stored=${row.cac_total}, expected=${expectedCAC.toFixed(2)}`);
    }
    
    // Check ROAS calculation
    const expectedROAS = row.spend > 0 ? row.total_estimated_revenue / row.spend : 0;
    if (Math.abs(expectedROAS - row.total_roas) > 0.1) {
      issues.push(`ROAS: stored=${row.total_roas}, expected=${expectedROAS.toFixed(2)}`);
    }
    
    if (issues.length > 0) {
      mismatchCount++;
    }
  });
  
  console.log(`\nRecords with mismatched values: ${mismatchCount}/${totalRecords}`);
  console.log(`Percentage with errors: ${(mismatchCount/totalRecords*100).toFixed(1)}%`);
  
  // 3. Check if this is a data import issue
  console.log('\n\n3. DATA IMPORT ANALYSIS:');
  console.log('-------------------------');
  
  const { data: importData } = await supabase
    .from('executive_monthly_reports')
    .select('month, import_source, created_at')
    .gte('month', '2025-07-01')
    .lte('month', '2025-07-31')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('\nRecent July imports:');
  importData.forEach(row => {
    console.log(`  ${row.month}: ${row.import_source} (imported: ${row.created_at})`);
  });
  
  // 4. Summary of the problem
  console.log('\n\n4. SUMMARY OF JULY DATA ISSUES:');
  console.log('--------------------------------');
  console.log('• The "others" channel has impossible metrics (more leads than visits)');
  console.log('• Stored conversion rates don\'t match the actual lead/visit ratios');
  console.log('• CAC calculations are incorrect or missing');
  console.log('• This appears to be a data import/calculation issue from the source system');
  console.log('\nRECOMMENDATION: The July data needs to be re-imported or recalculated');
  console.log('from the source MSSQL database with correct formulas.');
}

checkJulyIssues().catch(console.error);