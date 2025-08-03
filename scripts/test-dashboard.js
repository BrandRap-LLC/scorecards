#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboard() {
  console.log('🧪 Testing Marketing Dashboard Data\n');
  
  // Test company: advancedlifeclinic.com
  const testCompany = 'advancedlifeclinic.com';
  
  console.log(`Testing for company: ${testCompany}`);
  console.log('=========================================\n');
  
  try {
    // Fetch data for test company
    const { data, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .eq('clinic', testCompany)
      .gte('month', '2024-12-01')
      .lte('month', '2025-08-31');
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} records for ${testCompany}\n`);
    
    // Group by traffic source
    const byChannel = {};
    data.forEach(row => {
      const channel = row.traffic_source;
      if (!byChannel[channel]) {
        byChannel[channel] = {
          count: 0,
          totalSpend: 0,
          totalLeads: 0,
          totalROAS: 0
        };
      }
      byChannel[channel].count++;
      byChannel[channel].totalSpend += row.spend || 0;
      byChannel[channel].totalLeads += row.leads || 0;
      byChannel[channel].totalROAS += row.total_roas || row.roas || 0;
    });
    
    console.log('Channel Performance Summary:');
    console.log('----------------------------');
    Object.entries(byChannel).forEach(([channel, stats]) => {
      console.log(`\n${channel}:`);
      console.log(`  Records: ${stats.count}`);
      console.log(`  Total Spend: $${(stats.totalSpend / 1000).toFixed(1)}K`);
      console.log(`  Total Leads: ${stats.totalLeads}`);
      console.log(`  Avg ROAS: ${(stats.totalROAS / stats.count).toFixed(2)}`);
    });
    
    // Test all companies have data
    console.log('\n\nTesting All Companies:');
    console.log('----------------------');
    
    const companies = [
      'advancedlifeclinic.com',
      'alluraderm.com',
      'bismarckbotox.com',
      'drridha.com',
      'genesis-medspa.com',
      'greenspringaesthetics.com',
      'medicalagecenter.com',
      'parkhillclinic.com',
      'skincareinstitute.net',
      'skinjectables.com',
      'youthful-image.com'
    ];
    
    for (const company of companies) {
      const { count } = await supabase
        .from('executive_monthly_reports')
        .select('*', { count: 'exact', head: true })
        .eq('clinic', company);
      
      console.log(`${company}: ${count} records ${count > 0 ? '✅' : '❌'}`);
    }
    
    console.log('\n\n✨ Dashboard Data Test Complete!');
    console.log('\nAccess the dashboard at:');
    console.log('- Landing page: http://localhost:3000/marketing');
    console.log(`- Company dashboard: http://localhost:3000/marketing/${testCompany}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboard();