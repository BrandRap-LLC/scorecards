const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  try {
    console.log('Verifying tables in Supabase...\n');

    const tablesToCheck = [
      'executive_summary',
      'executive_weekly_reports', 
      'ceo_monthly_reports',
      'ceo_weekly_reports'
    ];

    for (const tableName of tablesToCheck) {
      console.log(`Checking ${tableName}...`);
      
      try {
        // Try to query the table
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`  ❌ Table does not exist or error accessing: ${error.message}`);
        } else {
          console.log(`  ✅ Table exists`);
          
          // Get column information
          const { data: columns, error: columnsError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          if (!columnsError && columns !== null) {
            // The columns are in the response metadata, but we can infer from a query
            const { data: sample } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (sample && sample.length > 0) {
              const columnNames = Object.keys(sample[0]);
              console.log(`     Columns: ${columnNames.join(', ')}`);
            }
          }
        }
      } catch (err) {
        console.log(`  ❌ Error checking table: ${err.message}`);
      }
      
      console.log('');
    }

    // Check if executive_monthly_reports still exists (the one we use)
    console.log('Checking executive_monthly_reports (currently used table)...');
    const { count, error } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`  ✅ Table exists with ${count} records`);
    } else {
      console.log(`  ❌ Table check failed: ${error.message}`);
    }

  } catch (error) {
    console.error('Error verifying tables:', error);
    process.exit(1);
  }
}

verifyTables();