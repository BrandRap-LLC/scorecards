#!/usr/bin/env node

/**
 * Check Latest Sync: Verify the updated data in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLatestData() {
  console.log('🔍 Checking Latest Data in Supabase');
  console.log('====================================\n');
  
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    console.log(`📊 Total records: ${count}\n`);
    
    // Get latest month data
    const { data: latestData, error: latestError } = await supabase
      .from('executive_monthly_reports')
      .select('month, clinic, traffic_source')
      .order('month', { ascending: false })
      .limit(10);
      
    if (latestError) throw latestError;
    
    console.log('📅 Latest 10 records by month:');
    latestData.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.month} | ${record.clinic} | ${record.traffic_source}`);
    });
    
    // Get unique months
    const { data: monthData, error: monthError } = await supabase
      .from('executive_monthly_reports')
      .select('month')
      .order('month', { ascending: false });
      
    if (monthError) throw monthError;
    
    const uniqueMonths = [...new Set(monthData.map(r => r.month))];
    console.log(`\n📆 Available months: ${uniqueMonths.length}`);
    uniqueMonths.forEach(month => console.log(`  • ${month}`));
    
    // Check August 2025 data specifically
    const { data: augustData, error: augustError } = await supabase
      .from('executive_monthly_reports')
      .select('clinic, traffic_source, leads, spend')
      .eq('month', '2025-08-01')
      .limit(5);
      
    if (!augustError && augustData.length > 0) {
      console.log('\n🆕 August 2025 data sample:');
      augustData.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.clinic} | ${record.traffic_source} | Leads: ${record.leads} | Spend: $${record.spend}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
}

checkLatestData();