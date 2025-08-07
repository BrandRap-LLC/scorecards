#!/usr/bin/env node

/**
 * Check data structure to understand traffic source breakdown
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDataStructure() {
  console.log('🔍 Checking Data Structure');
  console.log('=========================\n');
  
  try {
    // Check a specific company's data for one month
    const testCompany = 'advancedlifeclinic.com';
    const testMonth = '2025-08-01';
    
    console.log(`📊 Checking ${testCompany} for ${testMonth}:`);
    
    const { data: records, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .eq('clinic', testCompany)
      .eq('month', testMonth)
      .order('traffic_source');
      
    if (error) throw error;
    
    console.log(`\nFound ${records.length} records for this company/month combination\n`);
    
    console.log('Traffic Sources:');
    records.forEach((record, i) => {
      console.log(`\n${i + 1}. ${record.traffic_source}:`);
      console.log(`   Impressions: ${record.impressions}`);
      console.log(`   Visits: ${record.visits}`);
      console.log(`   Leads: ${record.leads}`);
      console.log(`   Spend: $${record.spend}`);
      console.log(`   Revenue: $${record.total_estimated_revenue}`);
    });
    
    // Calculate totals
    console.log('\n📊 Totals for the month (sum of all traffic sources):');
    const totals = records.reduce((acc, record) => {
      acc.impressions += record.impressions || 0;
      acc.visits += record.visits || 0;
      acc.leads += record.leads || 0;
      acc.spend += record.spend || 0;
      acc.revenue += record.total_estimated_revenue || 0;
      return acc;
    }, {
      impressions: 0,
      visits: 0,
      leads: 0,
      spend: 0,
      revenue: 0
    });
    
    console.log(`   Total Impressions: ${totals.impressions}`);
    console.log(`   Total Visits: ${totals.visits}`);
    console.log(`   Total Leads: ${totals.leads}`);
    console.log(`   Total Spend: $${totals.spend.toFixed(2)}`);
    console.log(`   Total Revenue: $${totals.revenue.toFixed(2)}`);
    
    // Check all unique traffic sources
    console.log('\n📋 All unique traffic sources in database:');
    const { data: sources } = await supabase
      .from('executive_monthly_reports')
      .select('traffic_source')
      .order('traffic_source');
      
    const uniqueSources = [...new Set(sources.map(s => s.traffic_source))];
    uniqueSources.forEach(source => console.log(`   • ${source}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDataStructure();