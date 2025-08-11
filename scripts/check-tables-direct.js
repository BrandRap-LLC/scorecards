const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const connectionString = `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  console.log('Checking Supabase tables...\n');

  try {
    // 1. List all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    console.log('All tables in Supabase:');
    console.log('=======================');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // 2. Check specific executive/CEO related tables and get their schema
    const executiveTables = [
      'executive_monthly_reports',
      'executive_weekly_reports',
      'ceo_reports',
      'executive_reports',
      'ceo_report_full_week',
      'weekly_metrics'
    ];

    console.log('\n\nChecking executive/CEO related tables:');
    console.log('=====================================');

    for (const tableName of executiveTables) {
      // Check if table exists and get row count
      const countQuery = `SELECT COUNT(*) FROM public.${tableName}`;
      
      try {
        const countResult = await pool.query(countQuery);
        const rowCount = countResult.rows[0].count;
        console.log(`\n📊 ${tableName}: ${rowCount} rows`);

        // Get column information
        const schemaQuery = `
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `;
        
        const schemaResult = await pool.query(schemaQuery, [tableName]);
        
        if (schemaResult.rows.length > 0) {
          console.log('   Columns:');
          schemaResult.rows.forEach(col => {
            let typeInfo = col.data_type;
            if (col.character_maximum_length) {
              typeInfo += `(${col.character_maximum_length})`;
            }
            const nullable = col.is_nullable === 'YES' ? 'nullable' : 'not null';
            console.log(`   - ${col.column_name}: ${typeInfo} (${nullable})`);
          });
        }
      } catch (err) {
        if (err.code === '42P01') { // Table does not exist
          console.log(`\n❌ ${tableName}: Table does not exist`);
        } else {
          console.error(`Error checking ${tableName}:`, err.message);
        }
      }
    }

    // 3. Special detailed look at executive_monthly_reports
    console.log('\n\nDetailed look at executive_monthly_reports:');
    console.log('==========================================');
    
    const sampleQuery = `SELECT * FROM executive_monthly_reports LIMIT 1`;
    const sampleResult = await pool.query(sampleQuery);
    
    if (sampleResult.rows.length > 0) {
      console.log('Sample record:');
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
      
      // Get unique values for key columns
      const uniqueQuery = `
        SELECT 
          COUNT(DISTINCT clinic) as unique_clinics,
          COUNT(DISTINCT traffic_source) as unique_traffic_sources,
          COUNT(DISTINCT month) as unique_months,
          MIN(month) as earliest_month,
          MAX(month) as latest_month
        FROM executive_monthly_reports;
      `;
      
      const uniqueResult = await pool.query(uniqueQuery);
      console.log('\nData Summary:');
      console.log(JSON.stringify(uniqueResult.rows[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();