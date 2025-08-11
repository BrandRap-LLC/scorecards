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

async function checkCeoTables() {
  console.log('Checking CEO/Executive tables in detail...\n');

  try {
    // Check the CEO tables that exist
    const ceoTables = [
      'ceo_metrics',
      'ceo_metrics_weekly',
      'ceo_monthly_reports',
      'ceo_weekly_reports',
      'executive_summary'
    ];

    for (const tableName of ceoTables) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Table: ${tableName}`);
      console.log(`${'='.repeat(60)}`);

      // Get row count
      const countQuery = `SELECT COUNT(*) FROM public.${tableName}`;
      const countResult = await pool.query(countQuery);
      const rowCount = countResult.rows[0].count;
      console.log(`Total rows: ${rowCount}`);

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
      
      console.log('\nColumns:');
      schemaResult.rows.forEach(col => {
        let typeInfo = col.data_type;
        if (col.character_maximum_length) {
          typeInfo += `(${col.character_maximum_length})`;
        }
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
        console.log(`- ${col.column_name}: ${typeInfo} ${nullable}`);
      });

      // Get sample data if table has rows
      if (rowCount > 0) {
        const sampleQuery = `SELECT * FROM ${tableName} LIMIT 2`;
        const sampleResult = await pool.query(sampleQuery);
        
        console.log('\nSample records:');
        sampleResult.rows.forEach((row, i) => {
          console.log(`\nRecord ${i + 1}:`);
          console.log(JSON.stringify(row, null, 2));
        });

        // Get date range if applicable
        const dateColumns = ['month', 'week', 'week_ending', 'date', 'created_at'];
        for (const dateCol of dateColumns) {
          const checkDateQuery = `
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = $2
          `;
          const dateCheck = await pool.query(checkDateQuery, [tableName, dateCol]);
          
          if (dateCheck.rows.length > 0) {
            const rangeQuery = `
              SELECT 
                MIN(${dateCol}) as earliest,
                MAX(${dateCol}) as latest,
                COUNT(DISTINCT ${dateCol}) as unique_dates
              FROM ${tableName}
              WHERE ${dateCol} IS NOT NULL
            `;
            const rangeResult = await pool.query(rangeQuery);
            
            if (rangeResult.rows[0].earliest) {
              console.log(`\nDate range (${dateCol}):`);
              console.log(`- Earliest: ${rangeResult.rows[0].earliest}`);
              console.log(`- Latest: ${rangeResult.rows[0].latest}`);
              console.log(`- Unique dates: ${rangeResult.rows[0].unique_dates}`);
            }
            break; // Only check the first date column found
          }
        }
      } else {
        console.log('\n(Table is empty)');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCeoTables();