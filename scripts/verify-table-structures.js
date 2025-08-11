const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Parse the Supabase URL to get connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePassword = process.env.SUPABASE_DB_PASSWORD;

// Extract the project ID from the URL
const projectId = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)[1];

const client = new Client({
  host: `db.${projectId}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: supabasePassword,
  ssl: { rejectUnauthorized: false }
});

async function verifyTables() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database\n');

    const tables = ['executive_summary', 'ceo_weekly_reports', 'ceo_monthly_reports'];

    for (const tableName of tables) {
      console.log(`\n=== ${tableName.toUpperCase()} TABLE STRUCTURE ===`);
      
      const result = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log('Columns:');
      result.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
        console.log(`  - ${row.column_name}: ${row.data_type} ${nullable}${defaultVal}`);
      });

      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      console.log(`\nRow count: ${countResult.rows[0].count}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

verifyTables();