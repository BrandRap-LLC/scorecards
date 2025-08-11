#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking specific tables in Supabase:\n');
  
  const tablesToCheck = [
    'executive_monthly_reports',
    'executive_weekly_reports', 
    'ceo_metrics',
    'ceo_report',
    'weekly_metrics',
    'monthly_metrics'
  ];
  
  for (const tableName of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: Table does not exist`);
      } else {
        console.log(`✅ ${tableName}: Exists with ${count} records`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Error - ${err.message}`);
    }
  }
  
  // Also check table schema using raw SQL
  console.log('\n📋 Checking table schema directly:');
  
  const { data: tables, error } = await supabase.rpc('get_tables', {});
  
  if (!error && tables) {
    console.log('\nAll public tables in Supabase:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
  } else {
    // Alternative approach
    const { data, error: queryError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (!queryError && data) {
      console.log('\nAll public tables in Supabase:');
      data.forEach(table => console.log(`  - ${table.table_name}`));
    }
  }
}

checkTables();