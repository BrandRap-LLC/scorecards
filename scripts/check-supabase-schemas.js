#!/usr/bin/env node

/**
 * Check actual Supabase table schemas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSupabaseSchemas() {
  console.log('🔍 Checking Supabase Table Schemas');
  console.log('==================================\n');
  
  const tables = [
    'executive_summary',
    'executive_weekly_reports',
    'ceo_monthly_reports',
    'ceo_weekly_reports'
  ];
  
  for (const table of tables) {
    console.log(`\n📊 Table: ${table}`);
    console.log('-'.repeat(50));
    
    try {
      // Try to get one row to see the actual schema
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        
        // If error mentions missing columns, parse them out
        if (error.message.includes('column')) {
          console.log('\n⚠️  Column errors detected in error message');
        }
      } else {
        console.log('✅ Table exists and is accessible');
        
        // If we got data, show the columns
        if (data && data.length > 0) {
          console.log('\nColumns found:');
          Object.keys(data[0]).forEach(key => {
            console.log(`  - ${key}`);
          });
        } else {
          // Table exists but is empty, try to insert a dummy row to see the schema
          console.log('Table is empty, attempting test insert to discover schema...');
          
          // Create a test row based on table type
          let testRow = {};
          if (table.includes('weekly')) {
            testRow = { week: new Date().toISOString() };
          } else if (table.includes('monthly')) {
            testRow = { month: new Date().toISOString() };
          } else {
            testRow = { test: 'test' };
          }
          
          const { error: insertError } = await supabase
            .from(table)
            .insert(testRow);
          
          if (insertError) {
            console.log('\nSchema discovery from error:');
            console.log(insertError.message);
          }
        }
      }
      
      // Get row count
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (count !== null) {
        console.log(`\nRow count: ${count}`);
      }
      
    } catch (err) {
      console.log(`❌ Unexpected error: ${err.message}`);
    }
  }
  
  console.log('\n\n💡 Recommendations:');
  console.log('==================');
  console.log('1. Check if tables were created with correct schemas');
  console.log('2. Verify column names match between MSSQL and Supabase');
  console.log('3. Consider recreating tables with proper schemas if needed');
}

// Run check
checkSupabaseSchemas().catch(console.error);