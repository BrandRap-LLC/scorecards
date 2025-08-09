const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const columnsToRemove = [
  'total_conversations',
  'new_conversations',
  'returning_conversations',
  'avg_appointment_rev',
  'conversation_rate'
];

const tablesToCheck = [
  'executive_monthly_reports',
  'executive_weekly_reports',
  'paid_ads',
  'seo_channels'
];

async function checkColumnsInTables() {
  console.log('🔍 Checking for columns to remove\n');
  console.log('Columns to remove:', columnsToRemove.join(', '));
  console.log('Tables to check:', tablesToCheck.join(', '));
  console.log('\n' + '='.repeat(60) + '\n');

  for (const table of tablesToCheck) {
    console.log(`📊 Checking table: ${table}`);
    console.log('-'.repeat(40));
    
    try {
      // Fetch one row to see the columns
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error checking table: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const foundColumns = columnsToRemove.filter(col => columns.includes(col));
        
        if (foundColumns.length > 0) {
          console.log(`✅ Found columns to remove: ${foundColumns.join(', ')}`);
        } else {
          console.log('✅ No columns to remove in this table');
        }
        
        console.log(`Total columns in table: ${columns.length}`);
      } else {
        console.log('⚠️ Table is empty, cannot check columns');
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
    
    console.log();
  }
  
  console.log('='.repeat(60));
  console.log('\n📝 Next steps:');
  console.log('1. Run the SQL script to remove columns: scripts/remove-conversation-metrics.sql');
  console.log('2. Update migration scripts to exclude these columns');
  console.log('3. Test the application to ensure everything works');
}

checkColumnsInTables().catch(console.error);