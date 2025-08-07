#!/usr/bin/env node

/**
 * Verify the full resync - check all columns have data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyResync() {
  console.log('🔍 Verifying Full Resync Results');
  console.log('================================\n');
  
  try {
    // Check total count
    const { count } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
      
    console.log(`📊 Total records in Supabase: ${count}\n`);
    
    // Check data range
    const { data: dateRange } = await supabase
      .from('executive_monthly_reports')
      .select('month')
      .order('month', { ascending: false });
      
    const uniqueMonths = [...new Set(dateRange.map(r => r.month))];
    console.log(`📅 Date range: ${uniqueMonths.length} months`);
    console.log(`  From: ${uniqueMonths[uniqueMonths.length - 1]}`);
    console.log(`  To: ${uniqueMonths[0]}\n`);
    
    // Check new columns have data
    console.log('📋 Checking new columns for data:');
    
    const newColumns = [
      'total_roas', 'new_roas', 'new_leads', 'returning_leads',
      'total_conversion', 'new_conversion', 'total_estimated_revenue',
      'new_estimated_revenue', 'avg_appointment_rev', 'avg_estimated_ltv_6m'
    ];
    
    for (const column of newColumns) {
      const { data: sampleData } = await supabase
        .from('executive_monthly_reports')
        .select(column)
        .not(column, 'is', null)
        .gt(column, 0)
        .limit(5);
        
      const { count: nonNullCount } = await supabase
        .from('executive_monthly_reports')
        .select(column, { count: 'exact', head: true })
        .not(column, 'is', null);
        
      console.log(`\n  ${column}:`);
      console.log(`    Non-null records: ${nonNullCount}/${count}`);
      if (sampleData && sampleData.length > 0) {
        const values = sampleData.map(d => d[column]).slice(0, 3);
        console.log(`    Sample values: ${values.join(', ')}`);
      }
    }
    
    // Check August 2025 data specifically
    console.log('\n📊 August 2025 Data Check:');
    const { data: augustData, count: augustCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact' })
      .eq('month', '2025-08-01');
      
    console.log(`  Total August records: ${augustCount}`);
    
    if (augustData && augustData.length > 0) {
      console.log('\n  Sample August record with new columns:');
      const sample = augustData[0];
      console.log(`    Clinic: ${sample.clinic}`);
      console.log(`    Traffic: ${sample.traffic_source}`);
      console.log(`    Total ROAS: ${sample.total_roas}`);
      console.log(`    New ROAS: ${sample.new_roas}`);
      console.log(`    New Leads: ${sample.new_leads}`);
      console.log(`    Returning Leads: ${sample.returning_leads}`);
      console.log(`    Total Revenue: ${sample.total_estimated_revenue}`);
      console.log(`    New Revenue: ${sample.new_estimated_revenue}`);
      console.log(`    Avg Appointment Rev: ${sample.avg_appointment_rev}`);
    }
    
    // Check clinics
    const { data: clinicData } = await supabase
      .from('executive_monthly_reports')
      .select('clinic')
      .eq('month', '2025-08-01');
      
    const uniqueClinics = [...new Set(clinicData.map(r => r.clinic))];
    console.log(`\n📏 August 2025 clinics (${uniqueClinics.length}):`);
    uniqueClinics.forEach(clinic => console.log(`    • ${clinic}`));
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

verifyResync();