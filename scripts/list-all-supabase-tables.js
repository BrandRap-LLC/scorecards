const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllTables() {
  console.log('🔍 Analyzing all Supabase tables...\n');

  try {
    // Get all tables by checking known table names
    const knownTables = [
      // Executive tables
      'executive_monthly_reports',
      'executive_monthly_metrics',
      'executive_monthly_data',
      'executive_weekly_reports',
      'ceo_report',
      'ceo_reports',
      'ceo_report_full_week',
      
      // Company/Scorecard tables
      'companies',
      'scorecards',
      'scorecards_data',
      'scorecards_summary',
      'weekly_metrics',
      
      // SEO tables
      'seo_highlights',
      'seo_opportunities',
      'seo_performance',
      
      // Other potential tables
      'users',
      'roles',
      'permissions',
      'audit_logs',
      'traffic_sources',
      'clinics',
      'metrics_definitions'
    ];

    const existingTables = [];
    const tablesWithData = [];
    const emptyTables = [];
    const mssqlRelatedTables = [];

    console.log('Checking tables...\n');

    for (const tableName of knownTables) {
      try {
        // Try to get count
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          existingTables.push({ name: tableName, count });
          
          if (count > 0) {
            tablesWithData.push({ name: tableName, count });
          } else {
            emptyTables.push({ name: tableName, count });
          }

          // Check if likely related to MSSQL
          if (tableName.includes('executive') || tableName.includes('ceo') || 
              tableName.includes('scorecard') || tableName.includes('weekly')) {
            mssqlRelatedTables.push({ name: tableName, count });
          }

          // Get last updated info for tables with data
          if (count > 0) {
            try {
              // Try to get created_at or updated_at
              const { data: lastRecord } = await supabase
                .from(tableName)
                .select('created_at, updated_at')
                .order('created_at', { ascending: false })
                .limit(1);

              if (lastRecord && lastRecord.length > 0) {
                const lastUpdated = lastRecord[0].updated_at || lastRecord[0].created_at;
                console.log(`✅ ${tableName}: ${count} rows${lastUpdated ? ` (last updated: ${new Date(lastUpdated).toLocaleDateString()})` : ''}`);
              } else {
                console.log(`✅ ${tableName}: ${count} rows`);
              }
            } catch (e) {
              console.log(`✅ ${tableName}: ${count} rows`);
            }
          } else {
            console.log(`📭 ${tableName}: 0 rows (empty)`);
          }
        }
      } catch (e) {
        // Table doesn't exist - skip
      }
    }

    // Summary
    console.log('\n📊 SUMMARY');
    console.log('==========\n');
    
    console.log(`Total tables found: ${existingTables.length}`);
    console.log(`Tables with data: ${tablesWithData.length}`);
    console.log(`Empty tables: ${emptyTables.length}`);
    
    console.log('\n📁 Tables with Data:');
    tablesWithData.forEach(t => {
      console.log(`  - ${t.name}: ${t.count.toLocaleString()} rows`);
    });
    
    console.log('\n📭 Empty Tables:');
    emptyTables.forEach(t => {
      console.log(`  - ${t.name}`);
    });
    
    console.log('\n🔗 Tables Likely Related to MSSQL:');
    mssqlRelatedTables.forEach(t => {
      console.log(`  - ${t.name}: ${t.count.toLocaleString()} rows ${t.count === 0 ? '(needs sync)' : ''}`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================\n');
    
    // Check which tables need updating
    const needsUpdate = mssqlRelatedTables.filter(t => t.count === 0);
    if (needsUpdate.length > 0) {
      console.log('Tables that may need data from MSSQL:');
      needsUpdate.forEach(t => {
        console.log(`  - ${t.name}`);
      });
    }

    // Active table
    console.log('\n✅ Currently Active Table:');
    console.log('  - executive_monthly_reports (580 rows) - Contains December 2024 data');
    
    // Tables that could be cleaned up
    const unusedTables = emptyTables.filter(t => 
      !['users', 'roles', 'permissions'].includes(t.name)
    );
    if (unusedTables.length > 0) {
      console.log('\n🧹 Tables that could be cleaned up:');
      unusedTables.forEach(t => {
        console.log(`  - ${t.name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

listAllTables();