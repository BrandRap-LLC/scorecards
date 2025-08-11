const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('Checking Supabase tables...\n');

  try {
    // 1. List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');

    if (tablesError) {
      // Fallback to raw SQL query
      const { data: tablesData, error: sqlError } = await supabase.rpc('get_all_tables', {});
      
      if (sqlError) {
        console.error('Error fetching tables:', sqlError);
        return;
      }
      
      console.log('All tables in Supabase:');
      console.log('=======================');
      tablesData.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('All tables in Supabase:');
      console.log('=======================');
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }

    // 2. Check for executive/CEO related tables
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
      // Get row count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`\n📊 ${tableName}: ${count} rows`);

        // Get schema information
        const { data: schemaData, error: schemaError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!schemaError && schemaData && schemaData.length > 0) {
          console.log('   Columns:');
          const columns = Object.keys(schemaData[0]);
          columns.forEach(col => {
            const value = schemaData[0][col];
            const type = value === null ? 'unknown' : typeof value;
            console.log(`   - ${col} (${type})`);
          });
        }
      } else {
        console.log(`\n❌ ${tableName}: Table does not exist`);
      }
    }

    // 3. Special check for executive_monthly_reports
    console.log('\n\nDetailed look at executive_monthly_reports:');
    console.log('==========================================');
    
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);

    if (!monthlyError && monthlyData && monthlyData.length > 0) {
      console.log('Sample record:');
      console.log(JSON.stringify(monthlyData[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();