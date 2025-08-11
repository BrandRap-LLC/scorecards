import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

// Use the provided connection string
const connectionString = 'postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixNumericPrecision() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('Connected to Supabase PostgreSQL database\n');

    // Execute the ALTER TABLE command
    console.log('Updating column types to handle larger numeric values...');
    
    const alterQuery = `
      ALTER TABLE executive_monthly_reports
      ALTER COLUMN estimated_ltv_6m TYPE DECIMAL(15,2),
      ALTER COLUMN total_estimated_revenue TYPE DECIMAL(15,2),
      ALTER COLUMN new_estimated_revenue TYPE DECIMAL(15,2),
      ALTER COLUMN total_roas TYPE DECIMAL(15,4),
      ALTER COLUMN new_roas TYPE DECIMAL(15,4);
    `;

    await client.query(alterQuery);
    console.log('✅ Successfully updated column types\n');

    // Verify the changes
    console.log('Verifying column specifications...\n');
    
    const verifyQuery = `
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports'
      AND column_name IN ('estimated_ltv_6m', 'total_estimated_revenue', 'new_estimated_revenue', 'total_roas', 'new_roas')
      ORDER BY column_name;
    `;

    const result = await client.query(verifyQuery);
    
    console.log('Updated column specifications:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Column Name                    | Data Type | Precision | Scale');
    console.log('───────────────────────────────────────────────────────────────');
    
    result.rows.forEach(row => {
      console.log(
        `${row.column_name.padEnd(30)} | ${row.data_type.padEnd(9)} | ${
          (row.numeric_precision || 'N/A').toString().padEnd(9)
        } | ${row.numeric_scale || 'N/A'}`
      );
    });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n✅ Numeric precision fix completed successfully!');
    console.log('\nThese columns can now handle:');
    console.log('  - estimated_ltv_6m: up to 9,999,999,999,999.99');
    console.log('  - total_estimated_revenue: up to 9,999,999,999,999.99');
    console.log('  - new_estimated_revenue: up to 9,999,999,999,999.99');
    console.log('  - total_roas: up to 99,999,999,999.9999');
    console.log('  - new_roas: up to 99,999,999,999.9999');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the fix
fixNumericPrecision();