#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableSchema() {
  console.log('📊 Checking table schema...\n');
  
  try {
    // Get column information
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'executive_monthly_reports' });
    
    if (error) {
      // Try a different approach - get one row and check its structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error:', sampleError);
        
        // Last resort - try inserting a minimal record to see what columns exist
        console.log('Attempting minimal insert to discover schema...');
        const { error: insertError } = await supabase
          .from('executive_monthly_reports')
          .insert({
            clinic: 'test',
            month: '2024-01-01',
            traffic_source: 'test'
          });
        
        console.log('Insert error details:', insertError);
      } else if (sampleData && sampleData.length > 0) {
        console.log('Columns found in executive_monthly_reports:');
        Object.keys(sampleData[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof sampleData[0][col]}`);
        });
      } else {
        console.log('Table exists but is empty');
        
        // Try to get schema info using information_schema
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'executive_monthly_reports');
        
        if (schemaData) {
          console.log('Schema from information_schema:', schemaData);
        }
      }
    } else {
      console.log('Columns in executive_monthly_reports:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkTableSchema();