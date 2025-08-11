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

async function createTables() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database\n');

    // Create executive_summary table
    console.log('Creating executive_summary table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS executive_summary (
        clinic text,
        month text,
        traffic_source text,
        appointments numeric,
        appointments_new numeric,
        appointments_returning numeric,
        estimated_ltv_6m numeric,
        estimated_revenue numeric,
        conversations numeric,
        conversations_new numeric,
        conversations_returning numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    console.log('✅ executive_summary table created successfully');

    // Create ceo_weekly_reports table
    console.log('\nCreating ceo_weekly_reports table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ceo_weekly_reports (
        week numeric,
        company text,
        clinic text,
        impressions numeric,
        visits numeric,
        leads numeric,
        appointments numeric,
        spend numeric,
        ltv numeric,
        roas numeric,
        conversion_rate numeric,
        cost_per_lead numeric,
        cost_per_appointment numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    console.log('✅ ceo_weekly_reports table created successfully');

    // Create ceo_monthly_reports table
    console.log('\nCreating ceo_monthly_reports table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ceo_monthly_reports (
        month text,
        company text,
        clinic text,
        impressions numeric,
        visits numeric,
        leads numeric,
        appointments numeric,
        spend numeric,
        ltv numeric,
        roas numeric,
        conversion_rate numeric,
        cost_per_lead numeric,
        cost_per_appointment numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    console.log('✅ ceo_monthly_reports table created successfully');

    // Verify tables were created
    console.log('\nVerifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('executive_summary', 'ceo_weekly_reports', 'ceo_monthly_reports')
      ORDER BY table_name;
    `);

    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

createTables();