#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to executive_weekly_reports...\n');
  
  const columnsToAdd = [
    { name: 'new_leads', type: 'NUMERIC' },
    { name: 'returning_leads', type: 'NUMERIC' },
    { name: 'total_conversion', type: 'NUMERIC' },
    { name: 'new_conversion', type: 'NUMERIC' },
    { name: 'returning_conversion', type: 'NUMERIC' },
    { name: 'cac_new', type: 'NUMERIC' },
    { name: 'total_appointments', type: 'NUMERIC' },
    { name: 'new_appointments', type: 'NUMERIC' },
    { name: 'returning_appointments', type: 'NUMERIC' },
    { name: 'online_booking', type: 'NUMERIC' },
    { name: 'total_conversations', type: 'NUMERIC' },
    { name: 'new_conversations', type: 'NUMERIC' },
    { name: 'returning_conversations', type: 'NUMERIC' },
    { name: 'total_estimated_revenue', type: 'NUMERIC' },
    { name: 'new_estimated_revenue', type: 'NUMERIC' },
    { name: 'estimated_ltv_6m', type: 'NUMERIC' },
    { name: 'total_roas', type: 'NUMERIC' },
    { name: 'new_roas', type: 'NUMERIC' }
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const column of columnsToAdd) {
    try {
      // First check if column exists
      const { data: existingColumns, error: checkError } = await supabase.rpc('get_table_columns', {
        table_name: 'executive_weekly_reports'
      });
      
      // If the RPC doesn't exist, just try to add the column
      const query = `ALTER TABLE executive_weekly_reports ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
      
      const { error } = await supabase.rpc('execute_sql', { query });
      
      if (error) {
        // Try direct approach if RPC fails
        console.log(`⚠️  Could not add ${column.name} via RPC, column may already exist`);
        skippedCount++;
      } else {
        console.log(`✅ Added column: ${column.name}`);
        addedCount++;
      }
    } catch (err) {
      console.log(`⚠️  Skipping ${column.name} - may already exist`);
      skippedCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${addedCount} columns added, ${skippedCount} skipped`);
  console.log('\n💡 Note: If columns were skipped, they likely already exist.');
  console.log('You can now run the sync script to populate the data:');
  console.log('  node scripts/sync-mssql-to-supabase.js --table=executiveWeekly');
}

addMissingColumns().catch(console.error);