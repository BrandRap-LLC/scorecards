#!/usr/bin/env node

/**
 * Compare MSSQL and Supabase schemas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function compareSchemas() {
  console.log('🔍 Comparing MSSQL and Supabase Schemas');
  console.log('=======================================\n');
  
  try {
    // Get Supabase table info using SQL query
    console.log('📊 Fetching Supabase schema...');
    const { data: supabaseSchema, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(0);
      
    if (error) {
      console.error('Error fetching Supabase schema:', error);
      return;
    }
    
    // Get actual column info via SQL
    const { data: columnInfo, error: columnError } = await supabase.rpc('get_table_schema', {
      table_name: 'executive_monthly_reports'
    }).single();
    
    // If RPC doesn't exist, try direct SQL
    const { data: columns, error: sqlError } = await supabase.rpc('query_columns', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'executive_monthly_reports'
        ORDER BY ordinal_position
      `
    });
    
    // Manual check - let's just query the table structure
    console.log('\n📋 Current Supabase columns (from create statement):');
    const supabaseColumns = [
      'id', 'clinic', 'month', 'traffic_source', 'impressions', 'visits', 
      'spend', 'ltv', 'estimated_ltv_6m', 'avg_ltv', 'roas', 'leads', 
      'conversion_rate', 'cac_total', 'cac_new', 'total_appointments', 
      'new_appointments', 'returning_appointments', 'online_booking', 
      'total_conversations', 'new_conversations', 'returning_conversations',
      'created_at', 'import_source'
    ];
    
    console.log('Total columns in Supabase:', supabaseColumns.length);
    supabaseColumns.forEach((col, i) => console.log(`  ${i + 1}. ${col}`));
    
    console.log('\n📋 MSSQL columns (from check):');
    const mssqlColumns = [
      'clinic', 'month', 'traffic_source', 'impressions', 'visits', 'spend',
      'ltv', 'estimated_ltv_6m', 'avg_ltv', 'total_roas', 'new_roas', 'leads',
      'new_leads', 'returning_leads', '%total_conversion', '%new_conversion',
      'cac_total', 'cac_new', 'total_estimated_revenue', 'new_estimated_revenue',
      'total_appointments', 'new_appointments', 'returning_appointments',
      'online_booking', 'total_conversations', 'new_conversations',
      'returning_conversations', 'avg_appointment_rev', 'avg_estimated_ltv_6m'
    ];
    
    console.log('Total columns in MSSQL:', mssqlColumns.length);
    
    console.log('\n❌ Missing columns in Supabase:');
    const missingColumns = mssqlColumns.filter(col => {
      // Map MSSQL columns to potential Supabase equivalents
      const mappings = {
        'total_roas': 'roas',  // Might be mapped
        '%total_conversion': 'conversion_rate',  // Might be mapped
        '%new_conversion': null  // Not mapped
      };
      
      const supabaseCol = mappings[col] || col;
      return !supabaseColumns.includes(supabaseCol);
    });
    
    missingColumns.forEach((col, i) => console.log(`  ${i + 1}. ${col}`));
    
    console.log('\n📊 Columns that need to be added:');
    const columnsToAdd = [
      { name: 'total_roas', type: 'DECIMAL(10,2)' },
      { name: 'new_roas', type: 'DECIMAL(10,2)' },
      { name: 'new_leads', type: 'INTEGER' },
      { name: 'returning_leads', type: 'INTEGER' },
      { name: 'total_conversion', type: 'DECIMAL(5,2)' },  // renamed from %total_conversion
      { name: 'new_conversion', type: 'DECIMAL(5,2)' },    // renamed from %new_conversion
      { name: 'total_estimated_revenue', type: 'DECIMAL(10,2)' },
      { name: 'new_estimated_revenue', type: 'DECIMAL(10,2)' },
      { name: 'avg_appointment_rev', type: 'DECIMAL(10,2)' },
      { name: 'avg_estimated_ltv_6m', type: 'DECIMAL(10,2)' }
    ];
    
    columnsToAdd.forEach(col => {
      console.log(`  ALTER TABLE executive_monthly_reports ADD COLUMN ${col.name} ${col.type};`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

compareSchemas();