#!/usr/bin/env node

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sanitize numeric values
function sanitizeNumeric(value, fieldName = '') {
  if (value === null || value === undefined) return null;
  
  const num = Number(value);
  
  if (!isFinite(num) || isNaN(num)) {
    console.warn(`⚠️  Invalid numeric value for ${fieldName}: ${value} - setting to null`);
    return null;
  }
  
  const MAX_SAFE_VALUE = 999999999;
  if (Math.abs(num) > MAX_SAFE_VALUE) {
    console.warn(`⚠️  Capping large value for ${fieldName}: ${value} → ${Math.sign(num) * MAX_SAFE_VALUE}`);
    return Math.sign(num) * MAX_SAFE_VALUE;
  }
  
  return num;
}

async function syncSEOChannels() {
  console.log('🔍 Syncing SEO Channels Data...');
  console.log('===============================\n');
  
  const mssqlConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM seo_channels ORDER BY month DESC, clinic, traffic_source`);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('seo_reports')
      .delete()
      .neq('id', 0);
    
    if (!deleteError || deleteError.message.includes('no rows')) {
      console.log('🗑️  Cleared existing data in Supabase');
    }
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        sessions: sanitizeNumeric(row.sessions, 'sessions'),
        users: sanitizeNumeric(row.users, 'users'),
        bounce_rate: sanitizeNumeric(row.bounce_rate, 'bounce_rate'),
        pages_per_session: sanitizeNumeric(row.pages_per_session, 'pages_per_session'),
        avg_session_duration: sanitizeNumeric(row.avg_session_duration, 'avg_session_duration'),
        sessions_mom: sanitizeNumeric(row.sessions_mom, 'sessions_mom'),
        users_mom: sanitizeNumeric(row.users_mom, 'users_mom'),
        bounce_rate_mom: sanitizeNumeric(row.bounce_rate_mom, 'bounce_rate_mom'),
        pages_per_session_mom: sanitizeNumeric(row.pages_per_session_mom, 'pages_per_session_mom'),
        avg_session_duration_mom: sanitizeNumeric(row.avg_session_duration_mom, 'avg_session_duration_mom')
      }));
      
      const { error: insertError } = await supabase
        .from('seo_reports')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      process.stdout.write(`\r✅ Progress: ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`\n\n✅ SEO Channels sync complete: ${inserted} records`);
    
    // Show sample data
    const { data: sample } = await supabase
      .from('seo_reports')
      .select('*')
      .limit(3);
    
    if (sample && sample.length > 0) {
      console.log('\n📊 Sample of synced data:');
      sample.forEach(row => {
        console.log(`  - ${row.clinic} | ${row.month} | ${row.traffic_source} | Sessions: ${row.sessions}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

syncSEOChannels().catch(console.error);