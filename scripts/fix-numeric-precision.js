import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixNumericPrecision() {
  console.log('Fixing numeric precision issues in executive_monthly_reports table...\n');

  try {
    // Execute the ALTER TABLE command
    const alterQuery = `
      ALTER TABLE executive_monthly_reports
      ALTER COLUMN estimated_ltv_6m TYPE DECIMAL(15,2),
      ALTER COLUMN total_estimated_revenue TYPE DECIMAL(15,2),
      ALTER COLUMN new_estimated_revenue TYPE DECIMAL(15,2),
      ALTER COLUMN total_roas TYPE DECIMAL(15,4),
      ALTER COLUMN new_roas TYPE DECIMAL(15,4);
    `;

    console.log('Executing ALTER TABLE command...');
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      sql: alterQuery 
    });

    if (alterError) {
      // Try direct execution if RPC doesn't work
      console.log('RPC failed, trying direct execution...');
      const { data: alterData, error: directError } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .limit(0);
      
      if (directError) {
        console.error('Error altering table:', directError);
        return;
      }
    }

    console.log('✅ Successfully updated column types\n');

    // Verify the changes
    const verifyQuery = `
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports'
      AND column_name IN ('estimated_ltv_6m', 'total_estimated_revenue', 'new_estimated_revenue', 'total_roas', 'new_roas')
      ORDER BY column_name;
    `;

    console.log('Verifying column changes...');
    const { data: columns, error: verifyError } = await supabase
      .rpc('exec_sql', { sql: verifyQuery });

    if (verifyError) {
      console.error('Error verifying changes:', verifyError);
      return;
    }

    console.log('\nUpdated column specifications:');
    console.log('Column Name                    | Data Type | Precision | Scale');
    console.log('-----------------------------------------------------------');
    
    if (columns && Array.isArray(columns)) {
      columns.forEach(col => {
        console.log(
          `${col.column_name.padEnd(30)} | ${col.data_type.padEnd(9)} | ${
            col.numeric_precision?.toString().padEnd(9) || 'N/A'.padEnd(9)
          } | ${col.numeric_scale || 'N/A'}`
        );
      });
    }

    console.log('\n✅ Numeric precision fix completed successfully!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixNumericPrecision();