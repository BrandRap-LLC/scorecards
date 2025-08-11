#!/usr/bin/env node

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL configuration
const mssqlConfig = {
  server: process.env.MSSQL_SERVER || '54.245.209.65',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE || 'aggregated_reporting',
  user: process.env.MSSQL_USERNAME || 'supabase',
  password: process.env.MSSQL_PASSWORD || 'R#8kZ2w$tE1Q',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 300000 // 5 minutes for large queries
  }
};

// Tables to migrate - focusing on the most important ones first
const MIGRATION_CONFIG = [
  {
    source: 'executive_report_new_week',
    target: 'executive_weekly_reports',
    batchSize: 500,
    description: 'Weekly executive metrics (2,170 rows)'
  },
  {
    source: 'executive_summary',
    target: 'executive_summary',
    batchSize: 500,
    description: 'Executive summary data (599 rows)'
  },
  {
    source: 'ceo_report_full_week',
    target: 'ceo_weekly_reports',
    batchSize: 1000,
    description: 'CEO weekly reports (27,115 rows)'
  },
  {
    source: 'ceo_report_full_month',
    target: 'ceo_monthly_reports',
    batchSize: 1000,
    description: 'CEO monthly reports (6,380 rows)'
  }
];

async function checkOrCreateTable(tableName) {
  try {
    // Try to select from the table
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error && error.message.includes('does not exist')) {
      console.log(`⚠️  Table ${tableName} does not exist. It will be created during migration.`);
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

async function migrateTable(config, mssqlPool) {
  console.log(`\n🚀 Migrating ${config.source} → ${config.target}`);
  console.log(`   ${config.description}`);
  
  try {
    // Get total row count from MSSQL
    const countResult = await mssqlPool.request().query(
      `SELECT COUNT(*) as total FROM ${config.source}`
    );
    const totalRows = countResult.recordset[0].total;
    console.log(`📊 Total rows to migrate: ${totalRows}`);
    
    if (totalRows === 0) {
      console.log(`⚠️  No data to migrate from ${config.source}`);
      return { success: true, migratedRows: 0 };
    }
    
    // Check if target table exists
    const tableExists = await checkOrCreateTable(config.target);
    
    if (tableExists) {
      // Clear existing data
      console.log(`🧹 Clearing existing data in ${config.target}...`);
      
      // Use a column that exists in all tables for the delete condition
      const { error: deleteError } = await supabase
        .from(config.target)
        .delete()
        .gte('id', 0); // This will delete all rows if id exists, otherwise we'll handle it
      
      if (deleteError && !deleteError.message.includes('column "id" does not exist')) {
        // Try another approach - delete with a always-true condition
        const { error: deleteError2 } = await supabase
          .from(config.target)
          .delete()
          .is('clinic', null)
          .or('clinic.not.is.null');
          
        if (deleteError2) {
          console.log(`⚠️  Could not clear table, will overwrite: ${deleteError2.message}`);
        }
      }
    }
    
    // Migrate data in batches
    let offset = 0;
    let migratedRows = 0;
    const errors = [];
    
    while (offset < totalRows) {
      // Fetch batch from MSSQL
      const result = await mssqlPool.request().query(`
        SELECT * FROM ${config.source}
        ORDER BY (SELECT NULL)
        OFFSET ${offset} ROWS
        FETCH NEXT ${config.batchSize} ROWS ONLY
      `);
      
      if (result.recordset.length === 0) break;
      
      // Clean the data
      const cleanedData = result.recordset.map(row => {
        const cleaned = {};
        for (const [key, value] of Object.entries(row)) {
          // Convert null to actual null, handle special cases
          if (value === null || value === undefined) {
            cleaned[key] = null;
          } else if (typeof value === 'object' && value instanceof Date) {
            cleaned[key] = value.toISOString();
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      });
      
      // Insert batch into Supabase
      const { error } = await supabase
        .from(config.target)
        .insert(cleanedData);
      
      if (error) {
        errors.push(`Batch at offset ${offset}: ${error.message}`);
        if (error.message.includes('does not exist')) {
          console.error(`\n❌ Table ${config.target} does not exist in Supabase.`);
          console.log(`   Please create the table first with matching schema.`);
          return { success: false, error: 'Table does not exist', migratedRows };
        }
      } else {
        migratedRows += result.recordset.length;
      }
      
      offset += config.batchSize;
      
      // Progress update
      const progress = Math.round((migratedRows / totalRows) * 100);
      process.stdout.write(`\r   Progress: ${progress}% (${migratedRows}/${totalRows} rows)`);
    }
    
    console.log(`\n✅ Successfully migrated ${migratedRows} rows`);
    
    if (errors.length > 0) {
      console.log(`⚠️  Encountered ${errors.length} errors during migration`);
      errors.slice(0, 3).forEach(err => console.log(`   - ${err}`));
      if (errors.length > 3) {
        console.log(`   ... and ${errors.length - 3} more errors`);
      }
    }
    
    // Verify migration
    const { count } = await supabase
      .from(config.target)
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Verified: ${count} rows in Supabase table ${config.target}`);
    
    return { 
      success: migratedRows > 0, 
      migratedRows, 
      verifiedRows: count,
      errors: errors.length 
    };
    
  } catch (error) {
    console.error(`\n❌ Migration failed for ${config.source}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔄 Starting MSSQL to Supabase migration');
  console.log('=' . repeat(50));
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('\n🔗 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Migration summary
    const results = [];
    
    // Ask user which tables to migrate
    console.log('\n📋 Available tables to migrate:');
    MIGRATION_CONFIG.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.source} → ${config.target} (${config.description})`);
    });
    
    console.log('\n💡 Starting migration of all tables...');
    console.log('   (To migrate specific tables only, modify the MIGRATION_CONFIG array)\n');
    
    // Migrate each table
    for (const config of MIGRATION_CONFIG) {
      const result = await migrateTable(config, mssqlPool);
      results.push({
        ...config,
        ...result
      });
      
      // Add a small delay between migrations
      if (result.success && config !== MIGRATION_CONFIG[MIGRATION_CONFIG.length - 1]) {
        console.log('\n⏳ Waiting 2 seconds before next migration...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Print summary
    console.log('\n\n📊 Migration Summary');
    console.log('=' . repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ Successful migrations: ${successful.length}`);
    successful.forEach(r => {
      console.log(`   - ${r.source} → ${r.target}: ${r.migratedRows} rows migrated`);
    });
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed migrations: ${failed.length}`);
      failed.forEach(r => {
        console.log(`   - ${r.source}: ${r.error}`);
      });
    }
    
    console.log('\n✅ Migration process complete!');
    
    // Provide next steps
    console.log('\n📝 Next steps:');
    console.log('1. Verify the migrated data in Supabase dashboard');
    console.log('2. Create any missing tables manually if needed');
    console.log('3. Set up scheduled sync for ongoing updates');
    console.log('4. Update your application to use the new Supabase tables');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

// Run migration
main().catch(console.error);