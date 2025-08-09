const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeRemoveColumns() {
  console.log('🗑️  Removing conversation and avg appointment revenue columns\n');
  console.log('⚠️  This will permanently remove columns from the database\n');
  console.log('=' .repeat(60) + '\n');
  
  // Note: Supabase JS client doesn't support direct DDL operations like ALTER TABLE
  // We need to use the Supabase SQL editor or connect directly to PostgreSQL
  
  console.log('📝 SQL Commands to Execute:\n');
  
  const sqlCommands = [
    {
      table: 'executive_monthly_reports',
      sql: `ALTER TABLE executive_monthly_reports
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;`
    },
    {
      table: 'executive_weekly_reports',
      sql: `ALTER TABLE executive_weekly_reports
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;`
    },
    {
      table: 'paid_ads',
      sql: `ALTER TABLE paid_ads
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;`
    },
    {
      table: 'seo_channels',
      sql: `ALTER TABLE seo_channels
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;`
    }
  ];
  
  // Print each SQL command
  sqlCommands.forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd.table}:`);
    console.log(cmd.sql);
    console.log();
  });
  
  console.log('=' .repeat(60));
  console.log('\n⚠️  The Supabase JS client cannot execute ALTER TABLE commands directly.');
  console.log('\n📋 To execute these commands, you have two options:\n');
  
  console.log('Option 1: Use Supabase Dashboard');
  console.log('1. Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql');
  console.log('2. Copy the SQL from scripts/remove-conversation-metrics.sql');
  console.log('3. Paste and execute in the SQL editor\n');
  
  console.log('Option 2: Use psql command line');
  console.log('Run this command:');
  console.log(`psql "${process.env.DATABASE_URL || 'postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres'}" < scripts/remove-conversation-metrics.sql`);
  console.log('\n');
  
  // Let's at least verify current columns
  console.log('🔍 Verifying current table structures...\n');
  
  for (const cmd of sqlCommands) {
    try {
      const { data, error } = await supabase
        .from(cmd.table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error checking ${cmd.table}: ${error.message}`);
      } else if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const targetColumns = ['total_conversations', 'new_conversations', 'returning_conversations', 'avg_appointment_rev', 'conversation_rate'];
        const foundColumns = targetColumns.filter(col => columns.includes(col));
        
        if (foundColumns.length > 0) {
          console.log(`📊 ${cmd.table}: Found ${foundColumns.length} columns to remove`);
          console.log(`   Columns: ${foundColumns.join(', ')}`);
        } else {
          console.log(`✅ ${cmd.table}: No target columns found (may already be removed)`);
        }
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✨ Next Steps:');
  console.log('1. Execute the SQL commands using one of the options above');
  console.log('2. Run "node scripts/test-ui-changes.js" to verify removal');
  console.log('3. Test the application to ensure everything works correctly');
}

executeRemoveColumns().catch(console.error);