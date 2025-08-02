#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking executive-related tables in Supabase:\n');
  
  const tables = [
    'executive_monthly_metrics',
    'executive_monthly_data', 
    'executive_monthly_reports',
    'ceo_report'  // Original table from earlier attempts
  ];
  
  const activeTable = 'executive_monthly_reports'; // The one we're actually using
  const results = [];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      results.push({
        table,
        exists: true,
        count,
        status: table === activeTable ? '✅ ACTIVE' : '⚠️  UNUSED'
      });
      console.log(`${table === activeTable ? '✅' : '📊'} ${table}: ${count} records ${table === activeTable ? '(ACTIVE - contains migrated data)' : ''}`);
    } else if (error.message.includes('does not exist')) {
      console.log(`❌ ${table}: Table does not exist`);
    } else {
      console.log(`⚠️  ${table}: ${error.message}`);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('===========');
  const unusedTables = results.filter(r => r.exists && r.table !== activeTable);
  
  if (unusedTables.length > 0) {
    console.log('\nUnused tables that could be cleaned up:');
    unusedTables.forEach(t => {
      console.log(`  - ${t.table} (${t.count} records)`);
    });
    
    console.log('\n🧹 To clean up unused tables, run this SQL in Supabase:');
    console.log('```sql');
    unusedTables.forEach(t => {
      console.log(`DROP TABLE IF EXISTS ${t.table} CASCADE;`);
    });
    console.log('```');
  } else {
    console.log('✅ No unused tables found!');
  }
  
  console.log(`\n✅ Active table: ${activeTable} with ${results.find(r => r.table === activeTable)?.count || 0} records`);
}

checkTables().catch(console.error);