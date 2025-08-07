const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const connectionString = 'postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres';

async function dropColumns() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!\n');

    const columnsToRemove = [
      'avg_appointment_rev',
      'avg_estimated_ltv_6m',
      'avg_ltv',
      'ltv'
    ];

    for (const column of columnsToRemove) {
      try {
        console.log(`Dropping column: ${column}...`);
        await client.query(`ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS ${column};`);
        console.log(`✅ Successfully dropped column: ${column}`);
      } catch (err) {
        console.error(`❌ Failed to drop column ${column}:`, err.message);
      }
    }

    // Verify the table structure
    console.log('\nFetching updated table structure...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
      ORDER BY ordinal_position;
    `);

    console.log('\nCurrent columns in executive_monthly_reports:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Execute the function
dropColumns();