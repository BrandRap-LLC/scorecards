#!/usr/bin/env node

/**
 * Verify August 2025 Data in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAugustData() {
  console.log('🔍 Verifying August 2025 Data');
  console.log('================================\n');
  
  try {
    // Check August 2025 data
    const { data: augustData, error: augustError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .eq('month', '2025-08-01');
      
    if (augustError) throw augustError;
    
    console.log(`📊 August 2025 records: ${augustData.length}\n`);
    
    // Get unique clinics in August
    const uniqueClinics = [...new Set(augustData.map(r => r.clinic))];
    console.log(`🏥 Clinics with August data: ${uniqueClinics.length}`);
    uniqueClinics.forEach(clinic => console.log(`  • ${clinic}`));
    
    // Get all months ordered
    const { data: allMonths, error: monthError } = await supabase
      .from('executive_monthly_reports')
      .select('month')
      .order('month', { ascending: false });
      
    if (monthError) throw monthError;
    
    const uniqueMonths = [...new Set(allMonths.map(r => r.month))];
    console.log(`\n📅 All months in database (newest first):`);
    uniqueMonths.forEach((month, index) => {
      const label = index === 0 ? ' (MOST RECENT)' : '';
      console.log(`  ${index + 1}. ${month}${label}`);
    });
    
    // Sample August data
    console.log('\n📋 Sample August 2025 data:');
    const sampleData = augustData.slice(0, 5);
    sampleData.forEach((record, index) => {
      console.log(`\n  Record ${index + 1}:`);
      console.log(`    Clinic: ${record.clinic}`);
      console.log(`    Traffic: ${record.traffic_source}`);
      console.log(`    Leads: ${record.leads}`);
      console.log(`    Spend: $${record.spend}`);
      console.log(`    ROAS: ${record.roas}`);
    });
    
    // Check date formatting
    console.log('\n📆 Date format verification:');
    console.log(`  Latest month raw value: ${uniqueMonths[0]}`);
    console.log(`  Type: ${typeof uniqueMonths[0]}`);
    console.log(`  Should display as: August 2025`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyAugustData();