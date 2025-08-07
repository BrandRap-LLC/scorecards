#!/usr/bin/env node

/**
 * Update Supabase schema to match MSSQL exactly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Exact columns from MSSQL
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
  'total_conversion',  // Note: renamed from %total_conversion
  'new_conversion',    // Note: renamed from %new_conversion
  'returning_conversion', // Note: renamed from %returning_conversion
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

async function updateSchema() {
  console.log('🔄 Updating Supabase schema to match MSSQL exactly');
  console.log('=' .repeat(60));
  
  try {
    // Get current schema
    console.log('\n📊 Checking current schema...');
    const { data: testData } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);
    
    let currentColumns = [];
    if (testData && testData.length > 0) {
      currentColumns = Object.keys(testData[0]);
    } else {
      // Try to get schema using a different approach
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .insert({ 
          clinic: 'test', 
          month: '2025-01-01', 
          traffic_source: 'test',
          impressions: 0,
          visits: 0
        })
        .select();
      
      if (data && data.length > 0) {
        currentColumns = Object.keys(data[0]);
        // Delete the test record
        await supabase
          .from('executive_monthly_reports')
          .delete()
          .eq('clinic', 'test');
      }
    }
    
    console.log(`Current columns (${currentColumns.length}):`, currentColumns.join(', '));
    
    // Find columns to add
    const columnsToAdd = requiredColumns.filter(col => !currentColumns.includes(col));
    
    // Find columns to remove (excluding system columns)
    const systemColumns = ['id', 'created_at', 'import_source'];
    const columnsToRemove = currentColumns.filter(col => 
      !requiredColumns.includes(col) && !systemColumns.includes(col)
    );
    
    console.log('\n📋 Schema Changes Required:');
    
    if (columnsToAdd.length > 0) {
      console.log(`\n✅ Columns to ADD (${columnsToAdd.length}):`);
      columnsToAdd.forEach(col => console.log(`   + ${col}`));
    }
    
    if (columnsToRemove.length > 0) {
      console.log(`\n❌ Columns to REMOVE (${columnsToRemove.length}):`);
      columnsToRemove.forEach(col => console.log(`   - ${col}`));
    }
    
    if (columnsToAdd.length === 0 && columnsToRemove.length === 0) {
      console.log('\n✅ Schema already matches MSSQL requirements!');
      return;
    }
    
    // Generate SQL commands
    console.log('\n📝 SQL Commands to run in Supabase SQL Editor:\n');
    
    // Remove columns
    if (columnsToRemove.length > 0) {
      console.log('-- Remove extra columns');
      columnsToRemove.forEach(col => {
        console.log(`ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS ${col};`);
      });
      console.log();
    }
    
    // Add new columns
    if (columnsToAdd.length > 0) {
      console.log('-- Add missing columns');
      columnsToAdd.forEach(col => {
        let dataType = 'DOUBLE PRECISION';
        if (['clinic', 'traffic_source'].includes(col)) {
          dataType = 'TEXT';
        } else if (col === 'month') {
          dataType = 'DATE';
        } else if (col.includes('appointments') || col.includes('conversations') || 
                   col.includes('leads') || col.includes('booking') || 
                   col === 'impressions' || col === 'visits') {
          dataType = 'INTEGER';
        }
        console.log(`ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS ${col} ${dataType};`);
      });
    }
    
    console.log('\n✅ Run these SQL commands in Supabase to update the schema');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateSchema();