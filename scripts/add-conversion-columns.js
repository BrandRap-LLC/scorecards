const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function addConversionColumns() {
  console.log('Adding missing conversion columns to executive_monthly_reports...');
  
  try {
    // Add the columns
    const { data: alterResult, error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE executive_monthly_reports 
        ADD COLUMN IF NOT EXISTS "%new_conversion" NUMERIC,
        ADD COLUMN IF NOT EXISTS "%returning_conversion" NUMERIC;
      `
    });

    if (alterError) {
      console.error('Error adding columns:', alterError);
      throw alterError;
    }

    console.log('✓ Columns added successfully');

    // Add comments
    const { data: commentResult, error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN executive_monthly_reports."%new_conversion" IS 'New customer conversion rate as percentage';
        COMMENT ON COLUMN executive_monthly_reports."%returning_conversion" IS 'Returning customer conversion rate as percentage';
      `
    });

    if (commentError) {
      console.error('Error adding comments:', commentError);
      // This is not critical, continue
    } else {
      console.log('✓ Comments added successfully');
    }

    // Verify the columns were added
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, numeric_precision, numeric_scale')
      .eq('table_name', 'executive_monthly_reports')
      .in('column_name', ['%new_conversion', '%returning_conversion']);

    if (verifyError) {
      console.error('Error verifying columns:', verifyError);
    } else {
      console.log('\n✓ Verification - Columns found:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}(${col.numeric_precision},${col.numeric_scale})`);
      });
    }

    // Check current table schema
    const { data: allColumns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'executive_monthly_reports')
      .order('ordinal_position');

    if (!schemaError && allColumns) {
      console.log('\nComplete table schema:');
      console.log('Total columns:', allColumns.length);
      const conversionColumns = allColumns.filter(col => 
        col.column_name === '%new_conversion' || 
        col.column_name === '%returning_conversion'
      );
      console.log('Conversion columns found:', conversionColumns.length);
      conversionColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('Error in addConversionColumns:', error);
    process.exit(1);
  }
}

addConversionColumns();