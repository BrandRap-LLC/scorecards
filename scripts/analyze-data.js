#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeData() {
  console.log('🔍 Analyzing Data for Dashboard Planning\n');
  
  // 1. Analyze Executive Monthly Reports
  console.log('📊 Executive Monthly Reports Analysis:');
  console.log('=====================================');
  
  const { data: monthlyData, error: monthlyError } = await supabase
    .from('executive_monthly_reports')
    .select('*');
  
  if (!monthlyError && monthlyData) {
    // Get unique clinics
    const clinics = [...new Set(monthlyData.map(d => d.clinic))];
    console.log(`\nUnique Clinics: ${clinics.length}`);
    console.log('Sample Clinics:', clinics.slice(0, 5));
    
    // Get traffic sources
    const trafficSources = [...new Set(monthlyData.map(d => d.traffic_source))];
    console.log(`\nTraffic Sources: ${trafficSources.join(', ')}`);
    
    // Analyze metrics ranges
    const metrics = {
      spend: monthlyData.map(d => d.spend).filter(v => v > 0),
      leads: monthlyData.map(d => d.leads).filter(v => v > 0),
      appointments: monthlyData.map(d => d.total_appointments).filter(v => v > 0),
      conversion_rate: monthlyData.map(d => d.conversion_rate).filter(v => v > 0)
    };
    
    console.log('\nMetric Ranges:');
    for (const [key, values] of Object.entries(metrics)) {
      if (values.length > 0) {
        console.log(`  ${key}:`);
        console.log(`    Min: ${Math.min(...values)}`);
        console.log(`    Max: ${Math.max(...values)}`);
        console.log(`    Avg: ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}`);
      }
    }
    
    // Sample data structure
    console.log('\nSample Record Structure:');
    const sample = monthlyData[0];
    console.log(JSON.stringify(sample, null, 2));
  }
  
  // 2. Analyze Weekly Scorecards
  console.log('\n\n📈 Weekly Scorecards Analysis:');
  console.log('================================');
  
  const { data: weeklyData, error: weeklyError } = await supabase
    .from('scorecards_weekly')
    .select('*')
    .limit(100);
  
  if (!weeklyError && weeklyData) {
    const companies = [...new Set(weeklyData.map(d => d.company_id))];
    const metrics = [...new Set(weeklyData.map(d => d.metric_id))];
    const weeks = [...new Set(weeklyData.map(d => `${d.year}-W${d.week_number}`))];
    
    console.log(`Companies: ${companies.length}`);
    console.log(`Metrics Tracked: ${metrics.length}`);
    console.log(`Weeks of Data: ${weeks.length}`);
    
    // Get metric categories
    const { data: metricDefs } = await supabase
      .from('scorecards_metrics')
      .select('category')
      .limit(100);
    
    if (metricDefs) {
      const categories = [...new Set(metricDefs.map(m => m.category))];
      console.log(`\nMetric Categories: ${categories.join(', ')}`);
    }
  }
  
  // 3. Check for company mappings
  console.log('\n\n🏢 Company Analysis:');
  console.log('=====================');
  
  const { data: companies } = await supabase
    .from('companies')
    .select('*');
  
  if (companies) {
    console.log('Registered Companies:');
    companies.forEach(c => {
      console.log(`  - ${c.display_name} (ID: ${c.id})`);
    });
  }
}

analyzeData().catch(console.error);