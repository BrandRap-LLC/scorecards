const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addReturningConversionColumn() {
  try {
    console.log('🔧 Adding returning_conversion column to executive_monthly_reports table...');
    
    // Execute the ALTER TABLE command
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS returning_conversion DOUBLE PRECISION;'
    });

    if (error) {
      // If RPC doesn't exist, try direct query
      console.log('📝 Trying alternative method...');
      
      // Check if column already exists
      const { data: columns, error: columnsError } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .limit(1);
      
      if (columnsError) {
        throw columnsError;
      }
      
      if (columns && columns.length > 0 && 'returning_conversion' in columns[0]) {
        console.log('✅ Column returning_conversion already exists!');
        return;
      }
      
      // If we can't add the column directly, we'll need to use a different approach
      console.error('❌ Cannot add column directly. Please run the following SQL in Supabase dashboard:');
      console.log('\nALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS returning_conversion DOUBLE PRECISION;\n');
      return;
    }

    console.log('✅ Successfully added returning_conversion column!');
    
    // Verify the column was added
    const { data: testData, error: testError } = await supabase
      .from('executive_monthly_reports')
      .select('returning_conversion')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Column verified - it now exists in the table');
    }
    
  } catch (error) {
    console.error('❌ Error adding column:', error.message);
    console.error('\nPlease run the following SQL command in your Supabase dashboard:');
    console.log('\nALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS returning_conversion DOUBLE PRECISION;\n');
  }
}

addReturningConversionColumn();