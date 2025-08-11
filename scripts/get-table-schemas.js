#!/usr/bin/env node

/**
 * Get actual table schemas from Supabase using information_schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTableSchema(tableName) {
  console.log(`\n📊 ${tableName}`);
  console.log('-'.repeat(60));
  
  try {
    // Query information_schema to get column details
    const { data, error } = await supabase
      .rpc('get_table_info', { 
        table_name: tableName 
      })
      .single();
    
    if (error) {
      // If RPC doesn't exist, try a direct query approach
      // Let's try to get basic info by attempting an insert with empty object
      const { error: testError } = await supabase
        .from(tableName)
        .insert({});
      
      if (testError && testError.message) {
        // Parse required fields from error message
        console.log('Schema inference from error:');
        console.log(testError.message);
        
        // Try to extract column names from error
        const columnMatches = testError.message.match(/column "([^"]+)"/g);
        if (columnMatches) {
          console.log('\nDetected columns:');
          columnMatches.forEach(match => {
            const colName = match.match(/column "([^"]+)"/)[1];
            console.log(`  - ${colName}`);
          });
        }
      }
    } else if (data) {
      console.log('Columns:');
      data.columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
    // Get row count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nCurrent row count: ${count || 0}`);
    
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function checkAllSchemas() {
  console.log('🔍 Supabase Table Schema Analysis');
  console.log('=================================');
  
  const tables = [
    'executive_summary',
    'executive_weekly_reports', 
    'ceo_monthly_reports',
    'ceo_weekly_reports'
  ];
  
  // First, let's try to create the RPC function if it doesn't exist
  console.log('\n📝 Setting up schema query function...');
  
  for (const table of tables) {
    await getTableSchema(table);
  }
  
  // Provide SQL to check schemas manually
  console.log('\n\n💡 To check schemas manually in Supabase SQL Editor:');
  console.log('=====================================================');
  console.log(`
-- Check executive_summary columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'executive_summary'
ORDER BY ordinal_position;

-- Check executive_weekly_reports columns  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'executive_weekly_reports'
ORDER BY ordinal_position;

-- Check ceo_monthly_reports columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ceo_monthly_reports'
ORDER BY ordinal_position;

-- Check ceo_weekly_reports columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ceo_weekly_reports'
ORDER BY ordinal_position;
  `);
}

// Run check
checkAllSchemas().catch(console.error);