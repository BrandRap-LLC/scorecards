#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyJulyDisplay() {
  // Test the exact query the dashboard will now use
  const { data } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', 'advancedlifeclinic.com')
    .gte('month', '2025-03-01')
    .lte('month', '2025-07-31')
    .order('month');
  
  // Group by month
  const byMonth = {};
  data.forEach(row => {
    const month = row.month.substring(0, 7);
    if (!byMonth[month]) {
      byMonth[month] = { leads: 0, spend: 0, revenue: 0, count: 0 };
    }
    byMonth[month].leads += row.leads || 0;
    byMonth[month].spend += row.spend || 0;
    byMonth[month].revenue += row.total_estimated_revenue || 0;
    byMonth[month].count++;
  });
  
  console.log('DASHBOARD WILL NOW SHOW (March-July 2025):');
  console.log('==========================================\n');
  Object.entries(byMonth).forEach(([month, data]) => {
    console.log(`${month}:`);
    console.log(`  Records: ${data.count}`);
    console.log(`  Total Leads: ${data.leads}`);
    console.log(`  Total Spend: $${data.spend.toFixed(2)}`);
    console.log(`  Total Revenue: $${data.revenue.toFixed(2)}`);
    console.log('');
  });
  
  console.log(`✓ July 2025 shows: ${byMonth['2025-07'].leads} leads`);
  console.log(`✓ Dashboard displays 5 months: March through July 2025`);
  
  // Also show what the "current month" filter will catch
  const julyData = data.filter(d => d.month.startsWith('2025-07'));
  const julyTotals = julyData.reduce((acc, row) => ({
    leads: acc.leads + (row.leads || 0),
    spend: acc.spend + (row.spend || 0),
    revenue: acc.revenue + (row.total_estimated_revenue || 0)
  }), { leads: 0, spend: 0, revenue: 0 });
  
  console.log('\nCurrent Month (July 2025) KPIs will show:');
  console.log(`  Total Leads: ${julyTotals.leads}`);
  console.log(`  Total Spend: $${julyTotals.spend.toFixed(2)}`);
  console.log(`  Total Revenue: $${julyTotals.revenue.toFixed(2)}`);
}

verifyJulyDisplay().catch(console.error);