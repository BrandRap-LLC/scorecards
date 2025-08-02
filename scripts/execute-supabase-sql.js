#!/usr/bin/env node

/**
 * Execute SQL directly in Supabase
 * This script can run SQL files directly against your Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

async function executeSQLFile(filename) {
  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', filename);
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found: ${sqlPath}`);
      return false;
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log(`📝 Executing ${filename}...`);
    
    // Split SQL into individual statements (simple split by semicolon)
    // Note: This is a simple implementation and may not handle all SQL edge cases
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;
      
      try {
        // Execute the SQL statement
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        }).single();
        
        if (error) {
          // Try direct execution as an alternative
          const { error: directError } = await supabase.from('_sql').select(statement);
          
          if (directError) {
            console.error(`❌ Error executing statement: ${directError.message}`);
            console.error(`   Statement: ${statement.substring(0, 50)}...`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ Executed ${successCount} statements successfully`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements failed`);
    }
    
    return errorCount === 0;
    
  } catch (error) {
    console.error(`❌ Failed to execute SQL file: ${error.message}`);
    return false;
  }
}

async function resetDatabase() {
  console.log('\n🔄 Resetting database...\n');
  
  try {
    // Direct execution of reset commands
    const resetCommands = [
      // Disable RLS
      `ALTER TABLE IF EXISTS scorecards_weekly DISABLE ROW LEVEL SECURITY`,
      `ALTER TABLE IF EXISTS scorecards_metrics DISABLE ROW LEVEL SECURITY`,
      `ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY`,
      
      // Drop views
      `DROP VIEW IF EXISTS latest_scorecards CASCADE`,
      `DROP VIEW IF EXISTS scorecards_12week_history CASCADE`,
      
      // Truncate tables
      `TRUNCATE TABLE IF EXISTS scorecards_weekly CASCADE`,
      `TRUNCATE TABLE IF EXISTS scorecards_metrics CASCADE`,
      `TRUNCATE TABLE IF EXISTS companies CASCADE`,
      
      // Reset sequences
      `ALTER SEQUENCE IF EXISTS companies_id_seq RESTART WITH 1`,
      `ALTER SEQUENCE IF EXISTS scorecards_metrics_id_seq RESTART WITH 1`,
      `ALTER SEQUENCE IF EXISTS scorecards_weekly_id_seq RESTART WITH 1`,
    ];
    
    for (const cmd of resetCommands) {
      console.log(`Executing: ${cmd.substring(0, 50)}...`);
      // Note: Supabase doesn't expose direct SQL execution via JS client
      // You'll need to use the SQL editor in the dashboard
    }
    
    console.log('\n⚠️  Note: Direct SQL execution via JS client is limited.');
    console.log('Please use the Supabase SQL Editor for complex operations.');
    console.log('\nTo reset the database:');
    console.log('1. Go to: https://igzswopyyggvelncjmuh.supabase.co/project/igzswopyyggvelncjmuh/sql');
    console.log('2. Copy and paste the contents of sql/reset_tables.sql');
    console.log('3. Click "Run" to execute\n');
    
    return false;
    
  } catch (error) {
    console.error(`❌ Reset failed: ${error.message}`);
    return false;
  }
}

async function checkData() {
  console.log('\n🔍 Checking database state...\n');
  
  try {
    // Check companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('id');
    
    if (companiesError) {
      console.error(`❌ Error fetching companies: ${companiesError.message}`);
    } else {
      console.log(`📊 Companies: ${companies.length} records`);
      if (companies.length > 0) {
        console.log('   Sample companies:');
        companies.slice(0, 3).forEach(c => {
          console.log(`   - ${c.company_name} (${c.display_name})`);
        });
      }
    }
    
    // Check metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('scorecards_metrics')
      .select('*')
      .order('sort_order')
      .limit(5);
    
    if (metricsError) {
      console.error(`❌ Error fetching metrics: ${metricsError.message}`);
    } else {
      const { count } = await supabase
        .from('scorecards_metrics')
        .select('*', { count: 'exact', head: true });
      
      console.log(`\n📈 Metrics: ${count} total metrics`);
      if (metrics.length > 0) {
        console.log('   Sample metrics:');
        metrics.forEach(m => {
          console.log(`   - ${m.metric_code} (${m.category})`);
        });
      }
    }
    
    // Check weekly data
    const { data: weeklyData, count: weeklyCount } = await supabase
      .from('scorecards_weekly')
      .select('*', { count: 'exact' })
      .order('year', { ascending: false })
      .order('week_number', { ascending: false })
      .limit(5);
    
    console.log(`\n📅 Weekly Data: ${weeklyCount || 0} total records`);
    if (weeklyData && weeklyData.length > 0) {
      const latestWeek = weeklyData[0];
      console.log(`   Latest week: Year ${latestWeek.year}, Week ${latestWeek.week_number}`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Check failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('Usage: node execute-supabase-sql.js [command]');
    console.log('\nCommands:');
    console.log('  setup    - Run setup_supabase_tables.sql');
    console.log('  reset    - Reset all tables and data');
    console.log('  check    - Check current database state');
    console.log('  file <filename> - Execute a specific SQL file');
    process.exit(1);
  }
  
  switch (command) {
    case 'setup':
      await executeSQLFile('setup_supabase_tables.sql');
      break;
    
    case 'reset':
      await resetDatabase();
      break;
    
    case 'check':
      await checkData();
      break;
    
    case 'file':
      const filename = process.argv[3];
      if (!filename) {
        console.error('Please specify a SQL file to execute');
        process.exit(1);
      }
      await executeSQLFile(filename);
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}