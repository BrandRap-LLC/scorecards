#!/usr/bin/env node

/**
 * Migrate seo_hightlights_keyword_page_one from MSSQL to Supabase
 * This script imports SEO keyword ranking highlights data
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL configuration - using reporting database
const mssqlConfig = {
  server: '54.245.209.65',
  port: 1433,
  database: 'reporting',  // Note: using reporting database
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function createSupabaseTable() {
  console.log('📊 Creating Supabase table structure...');
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS seo_highlights_keyword_page_one (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255),
      query_group TEXT,
      query TEXT,
      period TIMESTAMP,
      period_type VARCHAR(50),
      current_rank NUMERIC(10,2),
      baseline_avg_rank NUMERIC(10,2),
      highlight_reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Add indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_seo_highlights_company ON seo_highlights_keyword_page_one(company_name);
    CREATE INDEX IF NOT EXISTS idx_seo_highlights_period ON seo_highlights_keyword_page_one(period);
    CREATE INDEX IF NOT EXISTS idx_seo_highlights_period_type ON seo_highlights_keyword_page_one(period_type);
    CREATE INDEX IF NOT EXISTS idx_seo_highlights_rank ON seo_highlights_keyword_page_one(current_rank);
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql_query: createTableQuery });
  
  if (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
  
  console.log('✅ Table structure created successfully\n');
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  const { error } = await supabase
    .from('seo_highlights_keyword_page_one')
    .delete()
    .neq('id', 0); // Delete all records
  
  if (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
  
  console.log('✅ Existing data cleared\n');
}

async function migrateData() {
  console.log('🚀 Starting migration from MSSQL to Supabase');
  console.log('===========================================\n');
  
  let mssqlPool;
  
  try {
    // Create Supabase table
    await createSupabaseTable();
    
    // Clear existing data
    await clearExistingData();
    
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL (reporting database)...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all data from MSSQL
    console.log('📥 Fetching data from MSSQL...');
    const result = await mssqlPool.request()
      .query('SELECT * FROM seo_hightlights_keyword_page_one ORDER BY Company_Name, period, query');
    
    console.log(`✅ Fetched ${result.recordset.length} records\n`);
    
    // Transform and insert data in batches
    console.log('📤 Inserting data into Supabase...');
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Transform data to match Supabase schema
      const transformedBatch = batch.map(row => ({
        company_name: row.Company_Name,
        query_group: row.query_group,
        query: row.query,
        period: row.period ? new Date(row.period).toISOString() : null,
        period_type: row.period_type,
        current_rank: row.current_rank,
        baseline_avg_rank: row.baseline_avg_rank,
        highlight_reason: row.highlight_reason
      }));
      
      // Insert batch into Supabase
      const { error } = await supabase
        .from('seo_highlights_keyword_page_one')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      insertedCount += batch.length;
      console.log(`   Inserted ${insertedCount}/${result.recordset.length} records...`);
    }
    
    console.log(`\n✅ Successfully migrated ${insertedCount} records\n`);
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    const { count, error: countError } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error verifying count:', countError);
    } else {
      console.log(`✅ Verified: ${count} records in Supabase\n`);
    }
    
    // Show summary statistics
    console.log('📊 Migration Summary:');
    console.log('====================');
    
    // Get unique companies
    const { data: companies } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('company_name')
      .order('company_name');
    
    const uniqueCompanies = [...new Set(companies?.map(c => c.company_name) || [])];
    console.log(`\nCompanies (${uniqueCompanies.length}):`);
    uniqueCompanies.forEach(company => {
      console.log(`  - ${company}`);
    });
    
    // Get period types
    const { data: periodTypes } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period_type')
      .order('period_type');
    
    const uniquePeriodTypes = [...new Set(periodTypes?.map(p => p.period_type) || [])];
    console.log(`\nPeriod Types:`);
    uniquePeriodTypes.forEach(type => {
      console.log(`  - ${type}`);
    });
    
    // Get date range
    const { data: dateRange } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period')
      .order('period', { ascending: true })
      .limit(1);
    
    const { data: latestDate } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period')
      .order('period', { ascending: false })
      .limit(1);
    
    if (dateRange && latestDate && dateRange[0] && latestDate[0]) {
      console.log(`\nDate Range:`);
      console.log(`  Earliest: ${new Date(dateRange[0].period).toLocaleDateString()}`);
      console.log(`  Latest: ${new Date(latestDate[0].period).toLocaleDateString()}`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Check if exec_sql function exists, if not create it
async function ensureExecSqlFunction() {
  const functionQuery = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    // Try to create the function directly via Supabase SQL editor
    console.log('Note: If table creation fails, you may need to create the exec_sql function manually in Supabase SQL editor.');
  } catch (error) {
    // Function might already exist or we might not have permissions
  }
}

// Run the migration
ensureExecSqlFunction()
  .then(() => migrateData())
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });