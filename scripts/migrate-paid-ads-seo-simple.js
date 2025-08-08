const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// MSSQL config
const mssqlConfig = {
  server: '54.245.209.65',
  port: 1433,
  database: 'aggregated_reporting',
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
  console.log('✅ Supabase connection successful\n');
  return true;
}

async function migratePaidAds(mssqlPool) {
  console.log('\n📊 Migrating paid_ads table...');
  
  try {
    // Get all data from MSSQL
    const result = await mssqlPool.request().query('SELECT * FROM paid_ads ORDER BY month, clinic, traffic_source');
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL paid_ads table`);
    
    if (records.length === 0) {
      console.log('No records to migrate');
      return;
    }
    
    // First, try to check if table exists by querying it
    const { error: checkError } = await supabase
      .from('paid_ads')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table paid_ads does not exist. Please create it first in Supabase dashboard with this SQL:');
      console.log(`
CREATE TABLE paid_ads (
  clinic text,
  month timestamp,
  traffic_source text,
  campaign text,
  impressions float,
  visits float,
  spend float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  avg_appointment_rev float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  total_conversations float,
  new_conversations float,
  returning_conversations float,
  conversation_rate float,
  appointment_rate float,
  ctr float
);
      `);
      return;
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('paid_ads').delete().gte('clinic', '');
    
    // Insert data in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data - handle nulls and format dates
      const transformedBatch = batch.map(record => ({
        clinic: record.clinic || null,
        month: record.month ? new Date(record.month).toISOString() : null,
        traffic_source: record.traffic_source || null,
        campaign: record.campaign || null,
        impressions: record.impressions ?? null,
        visits: record.visits ?? null,
        spend: record.spend ?? null,
        total_appointments: record.total_appointments ?? null,
        new_appointments: record.new_appointments ?? null,
        returning_appointments: record.returning_appointments ?? null,
        avg_appointment_rev: record.avg_appointment_rev ?? null,
        appointment_est_revenue: record.appointment_est_revenue ?? null,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue ?? null,
        total_conversations: record.total_conversations ?? null,
        new_conversations: record.new_conversations ?? null,
        returning_conversations: record.returning_conversations ?? null,
        conversation_rate: record.conversation_rate ?? null,
        appointment_rate: record.appointment_rate ?? null,
        ctr: record.ctr ?? null
      }));
      
      const { data, error } = await supabase
        .from('paid_ads')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.log('Sample record that failed:', transformedBatch[0]);
        throw error;
      }
      
      successCount += batch.length;
      console.log(`Progress: ${successCount}/${records.length} records`);
    }
    
    // Verify count
    const { count } = await supabase
      .from('paid_ads')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Successfully migrated ${count} records to Supabase paid_ads table`);
    
  } catch (err) {
    console.error('Error migrating paid_ads:', err);
    throw err;
  }
}

async function migrateSeoChannels(mssqlPool) {
  console.log('\n📊 Migrating seo_channels table...');
  
  try {
    // Get all data from MSSQL
    const result = await mssqlPool.request().query('SELECT * FROM seo_channels ORDER BY month, clinic, traffic_source');
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL seo_channels table`);
    
    if (records.length === 0) {
      console.log('No records to migrate');
      return;
    }
    
    // First, try to check if table exists by querying it
    const { error: checkError } = await supabase
      .from('seo_channels')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table seo_channels does not exist. Please create it first in Supabase dashboard with this SQL:');
      console.log(`
CREATE TABLE seo_channels (
  clinic text,
  month timestamp,
  traffic_source text,
  impressions float,
  visits float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  avg_appointment_rev float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  total_conversations float,
  new_conversations float,
  returning_conversations float,
  conversation_rate float,
  appointment_rate float,
  ctr float
);
      `);
      return;
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('seo_channels').delete().gte('clinic', '');
    
    // Insert data in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data - handle nulls and format dates
      const transformedBatch = batch.map(record => ({
        clinic: record.clinic || null,
        month: record.month ? new Date(record.month).toISOString() : null,
        traffic_source: record.traffic_source || null,
        impressions: record.impressions ?? null,
        visits: record.visits ?? null,
        total_appointments: record.total_appointments ?? null,
        new_appointments: record.new_appointments ?? null,
        returning_appointments: record.returning_appointments ?? null,
        avg_appointment_rev: record.avg_appointment_rev ?? null,
        appointment_est_revenue: record.appointment_est_revenue ?? null,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue ?? null,
        total_conversations: record.total_conversations ?? null,
        new_conversations: record.new_conversations ?? null,
        returning_conversations: record.returning_conversations ?? null,
        conversation_rate: record.conversation_rate ?? null,
        appointment_rate: record.appointment_rate ?? null,
        ctr: record.ctr ?? null
      }));
      
      const { data, error } = await supabase
        .from('seo_channels')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.log('Sample record that failed:', transformedBatch[0]);
        throw error;
      }
      
      successCount += batch.length;
      console.log(`Progress: ${successCount}/${records.length} records`);
    }
    
    // Verify count
    const { count } = await supabase
      .from('seo_channels')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Successfully migrated ${count} records to Supabase seo_channels table`);
    
  } catch (err) {
    console.error('Error migrating seo_channels:', err);
    throw err;
  }
}

async function main() {
  console.log('🚀 Starting migration of paid_ads and seo_channels tables\n');
  console.log('Configuration:');
  console.log(`  MSSQL Server: ${mssqlConfig.server}`);
  console.log(`  Supabase URL: ${supabaseUrl}\n`);
  
  let mssqlPool;
  
  try {
    // Test Supabase connection
    const supabaseOk = await testSupabaseConnection();
    if (!supabaseOk) {
      console.error('Cannot proceed without Supabase connection');
      process.exit(1);
    }
    
    // Connect to MSSQL
    console.log('Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Show the SQL needed to create tables
    console.log('\n📋 IMPORTANT: Before running migration, create tables in Supabase SQL Editor:');
    console.log('============================================================');
    console.log(`
-- Create paid_ads table
CREATE TABLE paid_ads (
  clinic text,
  month timestamp,
  traffic_source text,
  campaign text,
  impressions float,
  visits float,
  spend float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  avg_appointment_rev float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  total_conversations float,
  new_conversations float,
  returning_conversations float,
  conversation_rate float,
  appointment_rate float,
  ctr float
);

-- Create seo_channels table
CREATE TABLE seo_channels (
  clinic text,
  month timestamp,
  traffic_source text,
  impressions float,
  visits float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  avg_appointment_rev float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  total_conversations float,
  new_conversations float,
  returning_conversations float,
  conversation_rate float,
  appointment_rate float,
  ctr float
);

-- Create indexes for better performance
CREATE INDEX idx_paid_ads_clinic ON paid_ads(clinic);
CREATE INDEX idx_paid_ads_month ON paid_ads(month);
CREATE INDEX idx_paid_ads_traffic_source ON paid_ads(traffic_source);

CREATE INDEX idx_seo_channels_clinic ON seo_channels(clinic);
CREATE INDEX idx_seo_channels_month ON seo_channels(month);
CREATE INDEX idx_seo_channels_traffic_source ON seo_channels(traffic_source);
    `);
    console.log('============================================================\n');
    
    console.log('Press Ctrl+C now if you need to create the tables first.');
    console.log('Waiting 5 seconds before proceeding...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Migrate data
    await migratePaidAds(mssqlPool);
    await migrateSeoChannels(mssqlPool);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n👋 Closed MSSQL connection');
    }
  }
}

// Run the migration
main();