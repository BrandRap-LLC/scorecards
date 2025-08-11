#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTables() {
  console.log('🔍 Testing Supabase Tables\n');
  
  const tables = [
    'executive_monthly_reports',
    'executive_weekly_reports',
    'paid_ads_reports',
    'seo_reports'
  ];
  
  for (const table of tables) {
    console.log(`\n📊 Testing ${table}:`);
    console.log('========================');
    
    try {
      // Try to select one row
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log('❌ Table does not exist');
        } else {
          console.log(`❌ Error: ${error.message}`);
        }
      } else if (data && data.length > 0) {
        console.log('✅ Table exists with columns:');
        Object.keys(data[0]).forEach(col => {
          console.log(`   - ${col}`);
        });
      } else {
        console.log('✅ Table exists but is empty');
      }
    } catch (err) {
      console.log(`❌ Unexpected error: ${err.message}`);
    }
  }
  
  console.log('\n\n📝 Summary:');
  console.log('===========');
  console.log('To fix missing tables/columns, run the SQL commands from SYNC_TABLES_INSTRUCTIONS.md');
}

testTables().catch(console.error);