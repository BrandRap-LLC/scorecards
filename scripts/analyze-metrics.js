#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeMetrics() {
  // Get weekly metrics structure
  const { data: metrics } = await supabase
    .from('scorecards_metrics')
    .select('*')
    .order('category, sort_order');
  
  if (metrics) {
    const byCategory = {};
    metrics.forEach(m => {
      if (!byCategory[m.category]) byCategory[m.category] = [];
      byCategory[m.category].push({
        name: m.display_name,
        format: m.format_type
      });
    });
    
    console.log('📊 Weekly Scorecard Metrics by Category:');
    console.log('=========================================\n');
    for (const [cat, items] of Object.entries(byCategory)) {
      console.log(`${cat}:`);
      items.forEach(i => console.log(`  - ${i.name} (${i.format})`));
      console.log();
    }
  }
  
  // Check for weekly data availability
  const { data: weeklyData } = await supabase
    .from('scorecards_weekly')
    .select('year, week_number, company_id')
    .order('year desc, week_number desc')
    .limit(100);
  
  if (weeklyData && weeklyData.length > 0) {
    const latestWeek = weeklyData[0];
    console.log('\n📅 Weekly Data Availability:');
    console.log('============================');
    console.log(`Latest Week: ${latestWeek.year} Week ${latestWeek.week_number}`);
    
    const uniqueCompanies = [...new Set(weeklyData.map(d => d.company_id))];
    console.log(`Companies with weekly data: ${uniqueCompanies.length}`);
  }
}

analyzeMetrics().catch(console.error);