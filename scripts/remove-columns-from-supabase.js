const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeColumns() {
  console.log('🗑️  Removing conversation and avg appointment revenue columns\n');
  
  const alterStatements = [
    // executive_monthly_reports
    `ALTER TABLE executive_monthly_reports
     DROP COLUMN IF EXISTS total_conversations,
     DROP COLUMN IF EXISTS new_conversations,
     DROP COLUMN IF EXISTS returning_conversations`,
    
    // executive_weekly_reports
    `ALTER TABLE executive_weekly_reports
     DROP COLUMN IF EXISTS total_conversations,
     DROP COLUMN IF EXISTS new_conversations,
     DROP COLUMN IF EXISTS returning_conversations`,
    
    // paid_ads
    `ALTER TABLE paid_ads
     DROP COLUMN IF EXISTS total_conversations,
     DROP COLUMN IF EXISTS new_conversations,
     DROP COLUMN IF EXISTS returning_conversations,
     DROP COLUMN IF EXISTS avg_appointment_rev,
     DROP COLUMN IF EXISTS conversation_rate`,
    
    // seo_channels
    `ALTER TABLE seo_channels
     DROP COLUMN IF EXISTS total_conversations,
     DROP COLUMN IF EXISTS new_conversations,
     DROP COLUMN IF EXISTS returning_conversations,
     DROP COLUMN IF EXISTS avg_appointment_rev,
     DROP COLUMN IF EXISTS conversation_rate`
  ];
  
  const tables = [
    'executive_monthly_reports',
    'executive_weekly_reports',
    'paid_ads',
    'seo_channels'
  ];
  
  for (let i = 0; i < alterStatements.length; i++) {
    const table = tables[i];
    const sql = alterStatements[i];
    
    console.log(`\n📊 Processing table: ${table}`);
    console.log('-'.repeat(40));
    
    try {
      // Execute the ALTER statement using rpc
      const { data, error } = await supabase.rpc('exec_sql', {
        query: sql
      });
      
      if (error) {
        // Try alternative approach if rpc doesn't work
        console.log('⚠️ Note: Direct SQL execution not available via Supabase client');
        console.log('Please run the following SQL manually in Supabase SQL editor:');
        console.log('\n' + sql + '\n');
      } else {
        console.log('✅ Columns removed successfully');
      }
    } catch (err) {
      console.log('⚠️ Please run the following SQL manually in Supabase SQL editor:');
      console.log('\n' + sql + '\n');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📝 Manual Steps Required:');
  console.log('1. Go to Supabase SQL editor');
  console.log('2. Run the SQL script: scripts/remove-conversation-metrics.sql');
  console.log('3. Verify columns are removed by running: node scripts/check-columns-to-remove.js');
}

removeColumns().catch(console.error);