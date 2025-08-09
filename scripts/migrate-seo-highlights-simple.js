#!/usr/bin/env node

/**
 * Migrate seo_hightlights_keyword_page_one from MSSQL to Supabase
 * 
 * IMPORTANT: Before running this script, create the table in Supabase by running
 * the SQL in create-seo-highlights-table.sql in the Supabase SQL editor
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

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  const { error } = await supabase
    .from('seo_highlights_keyword_page_one')
    .delete()
    .neq('id', 0); // Delete all records
  
  if (error && error.code !== '42P01') { // Ignore "table does not exist" error
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
        console.error('Sample data:', transformedBatch[0]);
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
    
    // Get sample data
    const { data: sampleData } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*')
      .limit(5);
    
    console.log('\nSample migrated records:');
    sampleData?.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  Company: ${record.company_name}`);
      console.log(`  Query: ${record.query}`);
      console.log(`  Current Rank: ${record.current_rank}`);
      console.log(`  Reason: ${record.highlight_reason}`);
    });
    
    // Get unique companies count
    const { data: companies } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('company_name');
    
    const uniqueCompanies = [...new Set(companies?.map(c => c.company_name) || [])];
    console.log(`\n✅ Total unique companies: ${uniqueCompanies.length}`);
    
    // Get period types
    const { data: periodTypes } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period_type');
    
    const uniquePeriodTypes = [...new Set(periodTypes?.map(p => p.period_type) || [])];
    console.log(`✅ Period types: ${uniquePeriodTypes.join(', ')}`);
    
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

// Check if table exists
async function checkTableExists() {
  const { data, error } = await supabase
    .from('seo_highlights_keyword_page_one')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.error('\n❌ Table "seo_highlights_keyword_page_one" does not exist in Supabase!');
    console.error('\n📝 Please run the following steps:');
    console.error('1. Go to your Supabase dashboard');
    console.error('2. Navigate to the SQL editor');
    console.error('3. Run the SQL script in: scripts/create-seo-highlights-table.sql');
    console.error('4. Then run this migration script again\n');
    process.exit(1);
  }
  
  console.log('✅ Table exists in Supabase\n');
}

// Run the migration
checkTableExists()
  .then(() => migrateData())
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });