#!/usr/bin/env node

/**
 * Check if Supabase schema matches required MSSQL columns
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Required columns from MSSQL
const requiredColumns = [
  'avg_appointment_rev',
  'avg_estimated_ltv_6m',
  'avg_ltv',
  'cac_new',
  'cac_total',
  'estimated_ltv_6m',
  'impressions',
  'leads',
  'ltv',
  'new_appointments',
  'new_conversations',
  'new_conversion',
  'new_estimated_revenue',
  'new_leads',
  'new_roas',
  'online_booking',
  'returning_appointments',
  'returning_conversations',
  'returning_leads',
  'spend',
  'total_appointments',
  'total_conversations',
  'total_conversion',
  'total_estimated_revenue',
  'total_roas',
  'visits'
];

async function checkSchema() {
  console.log('🔍 Checking Supabase schema against required MSSQL columns');
  console.log('='.repeat(60));
  
  try {
    // Get one record to see current columns
    const { data: sample, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    if (!sample || sample.length === 0) {
      console.log('No data in table to check schema');
      return;
    }
    
    const currentColumns = Object.keys(sample[0]);
    console.log(`\n📊 Current Supabase columns: ${currentColumns.length}`);
    
    // Check for missing columns
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    const extraColumns = currentColumns.filter(col => 
      !requiredColumns.includes(col) && 
      !['id', 'clinic', 'month', 'traffic_source', 'created_at'].includes(col)
    );
    
    console.log(`\n✅ Required columns present: ${requiredColumns.filter(col => currentColumns.includes(col)).length}/${requiredColumns.length}`);
    
    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing columns (${missingColumns.length}):`);
      missingColumns.forEach(col => console.log(`   - ${col}`));
    } else {
      console.log('\n✅ All required columns are present!');
    }
    
    if (extraColumns.length > 0) {
      console.log(`\n⚠️  Extra columns not in required list (${extraColumns.length}):`);
      extraColumns.forEach(col => console.log(`   - ${col}`));
    }
    
    // Show current columns grouped by type
    console.log('\n📋 Current column mapping:');
    console.log('\nIdentity columns:');
    console.log('  - id, clinic, month, traffic_source, created_at');
    
    console.log('\nMetric columns present:');
    requiredColumns.forEach(col => {
      if (currentColumns.includes(col)) {
        console.log(`  ✅ ${col}`);
      } else {
        console.log(`  ❌ ${col} (MISSING)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();