const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL config
const mssqlConfig = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true
  }
};

async function updateSupabaseData() {
  let mssqlPool;
  
  try {
    console.log('🚀 Starting Supabase data update...\n');
    
    // Connect to MSSQL
    console.log('Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Update paid_ads from marketing_score_card_daily
    await updatePaidAds(mssqlPool);
    
    // Update SEO data
    await updateSeoChannels(mssqlPool);
    await updateSeoKeywords(mssqlPool);
    
    console.log('\n✅ All updates completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during update:', error.message);
    throw error;
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\nClosed MSSQL connection');
    }
  }
}

async function updatePaidAds(mssqlPool) {
  console.log('📊 Updating paid_ads table...');
  
  // Get latest date in Supabase
  const { data: latestData } = await supabase
    .from('paid_ads')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);
  
  const latestDate = latestData?.[0]?.date || '2000-01-01';
  console.log(`  Current latest date in Supabase: ${latestDate}`);
  
  // Fetch newer data from MSSQL
  const result = await mssqlPool.request()
    .input('latestDate', sql.Date, latestDate)
    .query(`
      SELECT 
        date,
        clinic,
        campaign,
        impressions,
        clicks,
        conversions,
        spend,
        ctr,
        conversion_rate,
        cost_per_conversion
      FROM marketing_score_card_daily
      WHERE date > @latestDate
      ORDER BY date, clinic, campaign
    `);
  
  if (result.recordset.length === 0) {
    console.log('  ✓ No new records to sync');
    return;
  }
  
  console.log(`  Found ${result.recordset.length} new records to sync`);
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < result.recordset.length; i += batchSize) {
    const batch = result.recordset.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('paid_ads')
      .insert(batch.map(row => ({
        date: row.date,
        clinic: row.clinic,
        campaign: row.campaign,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        spend: row.spend,
        ctr: row.ctr,
        conversion_rate: row.conversion_rate,
        cost_per_conversion: row.cost_per_conversion
      })));
    
    if (error) {
      console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      throw error;
    }
    
    console.log(`  ✓ Inserted batch ${i / batchSize + 1} of ${Math.ceil(result.recordset.length / batchSize)}`);
  }
  
  console.log(`  ✅ Successfully synced ${result.recordset.length} records to paid_ads\n`);
}

async function updateSeoChannels(mssqlPool) {
  console.log('📊 Updating seo_channels table...');
  
  // Get latest date in Supabase
  const { data: latestData } = await supabase
    .from('seo_channels')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);
  
  const latestDate = latestData?.[0]?.date || '2000-01-01';
  console.log(`  Current latest date in Supabase: ${latestDate}`);
  
  // Check if seo_channels table exists in MSSQL
  const tableCheck = await mssqlPool.request()
    .query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'seo_channels'
    `);
  
  if (tableCheck.recordset[0].count === 0) {
    console.log('  ⚠️  seo_channels table not found in MSSQL');
    return;
  }
  
  // Fetch newer data from MSSQL
  const result = await mssqlPool.request()
    .input('latestDate', sql.Date, latestDate)
    .query(`
      SELECT *
      FROM seo_channels
      WHERE date > @latestDate
      ORDER BY date
    `);
  
  if (result.recordset.length === 0) {
    console.log('  ✓ No new records to sync');
    return;
  }
  
  console.log(`  Found ${result.recordset.length} new records to sync`);
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < result.recordset.length; i += batchSize) {
    const batch = result.recordset.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('seo_channels')
      .insert(batch);
    
    if (error) {
      console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      throw error;
    }
    
    console.log(`  ✓ Inserted batch ${i / batchSize + 1} of ${Math.ceil(result.recordset.length / batchSize)}`);
  }
  
  console.log(`  ✅ Successfully synced ${result.recordset.length} records to seo_channels\n`);
}

async function updateSeoKeywords(mssqlPool) {
  console.log('📊 Updating seo_highlights_keyword_page_one table...');
  
  // Get latest date in Supabase
  const { data: latestData } = await supabase
    .from('seo_highlights_keyword_page_one')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);
  
  const latestDate = latestData?.[0]?.date || '2000-01-01';
  console.log(`  Current latest date in Supabase: ${latestDate}`);
  
  // Check available keyword tables
  const keywordTables = await mssqlPool.request()
    .query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%keyword%'
      ORDER BY TABLE_NAME
    `);
  
  console.log('  Available keyword tables in MSSQL:');
  keywordTables.recordset.forEach(row => {
    console.log(`    - ${row.TABLE_NAME}`);
  });
  
  // Check if score_card_keyword_summary has the right structure
  const columnCheck = await mssqlPool.request()
    .query(`
      SELECT TOP 1 *
      FROM score_card_keyword_summary
    `);
  
  if (columnCheck.recordset.length > 0) {
    console.log('\n  Sample score_card_keyword_summary columns:');
    Object.keys(columnCheck.recordset[0]).forEach(col => {
      console.log(`    - ${col}: ${typeof columnCheck.recordset[0][col]}`);
    });
  }
  
  // For now, just log what we found
  console.log('\n  ⚠️  SEO keyword sync requires manual mapping of columns\n');
}

// Run the update
updateSupabaseData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});