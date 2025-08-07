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

// Required columns from MSSQL (exact match)
const requiredColumns = [
  'clinic',
  'month',
  'traffic_source',
  'impressions',
  'visits',
  'spend',
  'estimated_ltv_6m',
  'total_roas',
  'new_roas',
  'leads',
  'new_leads',
  'returning_leads',
  'total_conversion',
  'new_conversion',
  'returning_conversion',
  'cac_total',
  'cac_new',
  'total_estimated_revenue',
  'new_estimated_revenue',
  'total_appointments',
  'new_appointments',
  'returning_appointments',
  'online_booking',
  'total_conversations',
  'new_conversations',
  'returning_conversations'
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