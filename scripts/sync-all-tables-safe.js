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
  
  // Convert to number
  const num = Number(value);
  
  // Handle special cases
  if (!isFinite(num) || isNaN(num)) {
    console.warn(`⚠️  Invalid numeric value for ${fieldName}: ${value} - setting to null`);
    return null;
  }
  
  // Cap extremely large values
  const MAX_SAFE_VALUE = 999999999; // Safe limit for numeric fields
  if (Math.abs(num) > MAX_SAFE_VALUE) {
    console.warn(`⚠️  Capping large value for ${fieldName}: ${value} → ${Math.sign(num) * MAX_SAFE_VALUE}`);
    return Math.sign(num) * MAX_SAFE_VALUE;
  }
  
  return num;
}

async function syncExecutiveMonthly() {
  console.log('\n📊 Syncing Executive Monthly Reports...');
  
  const mssqlConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM executive_report_new_month ORDER BY month DESC, clinic, traffic_source`);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('executive_monthly_reports')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) throw deleteError;
    console.log('🗑️  Cleared existing data in Supabase');
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        visits: sanitizeNumeric(row.visits, 'visits'),
        spend: sanitizeNumeric(row.spend, 'spend'),
        leads: sanitizeNumeric(row.leads, 'leads'),
        new_leads: sanitizeNumeric(row.new_leads, 'new_leads'),
        returning_leads: sanitizeNumeric(row.returning_leads, 'returning_leads'),
        conversion_rate: sanitizeNumeric(row.conversion_rate, 'conversion_rate'),
        new_conversion: sanitizeNumeric(row.new_conversion, 'new_conversion'),
        returning_conversion: sanitizeNumeric(row.returning_conversion, 'returning_conversion'),
        total_appointments: sanitizeNumeric(row.total_appointments, 'total_appointments'),
        new_appointments: sanitizeNumeric(row.new_appointments, 'new_appointments'),
        returning_appointments: sanitizeNumeric(row.returning_appointments, 'returning_appointments'),
        online_booking: sanitizeNumeric(row.online_booking, 'online_booking'),
        ltv: sanitizeNumeric(row.ltv, 'ltv'),
        roas: sanitizeNumeric(row.roas, 'roas'),
        estimated_ltv_6m: sanitizeNumeric(row.estimated_ltv_6m, 'estimated_ltv_6m'),
        cac_total: sanitizeNumeric(row.cac_total, 'cac_total'),
        cac_new: sanitizeNumeric(row.cac_new, 'cac_new'),
        total_estimated_revenue: sanitizeNumeric(row.total_estimated_revenue, 'total_estimated_revenue'),
        new_estimated_revenue: sanitizeNumeric(row.new_estimated_revenue, 'new_estimated_revenue'),
        total_roas: sanitizeNumeric(row.total_roas, 'total_roas'),
        new_roas: sanitizeNumeric(row.new_roas, 'new_roas'),
        total_conversations: sanitizeNumeric(row.total_conversations, 'total_conversations'),
        new_conversations: sanitizeNumeric(row.new_conversations, 'new_conversations'),
        returning_conversations: sanitizeNumeric(row.returning_conversations, 'returning_conversations')
      }));
      
      const { error: insertError } = await supabase
        .from('executive_monthly_reports')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`✅ Executive Monthly sync complete: ${inserted} records`);
    return { success: true, records: inserted };
    
  } catch (error) {
    console.error('❌ Error syncing executive monthly:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

async function syncExecutiveWeekly() {
  console.log('\n📊 Syncing Executive Weekly Reports...');
  
  const mssqlConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL (reporting)');
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM executive_report_current_week ORDER BY week DESC, clinic, traffic_source`);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('executive_weekly_reports')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) throw deleteError;
    console.log('🗑️  Cleared existing data in Supabase');
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        week: row.week,
        week_date: row.week_date ? new Date(row.week_date).toISOString() : null,
        traffic_source: row.traffic_source,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        impressions_wow: sanitizeNumeric(row.impressions_wow, 'impressions_wow'),
        visits: sanitizeNumeric(row.visits, 'visits'),
        visits_wow: sanitizeNumeric(row.visits_wow, 'visits_wow'),
        spend: sanitizeNumeric(row.spend, 'spend'),
        spend_wow: sanitizeNumeric(row.spend_wow, 'spend_wow'),
        leads: sanitizeNumeric(row.leads, 'leads'),
        leads_wow: sanitizeNumeric(row.leads_wow, 'leads_wow'),
        conversion_rate: sanitizeNumeric(row.conversion_rate, 'conversion_rate'),
        conversion_rate_wow: sanitizeNumeric(row.conversion_rate_wow, 'conversion_rate_wow'),
        appointments: sanitizeNumeric(row.appointments, 'appointments'),
        appointments_wow: sanitizeNumeric(row.appointments_wow, 'appointments_wow'),
        conversations: sanitizeNumeric(row.conversations, 'conversations'),
        conversations_wow: sanitizeNumeric(row.conversations_wow, 'conversations_wow'),
        cac_total: sanitizeNumeric(row.cac_total, 'cac_total'),
        cac_total_wow: sanitizeNumeric(row.cac_total_wow, 'cac_total_wow'),
        roas: sanitizeNumeric(row.roas, 'roas'),
        roas_wow: sanitizeNumeric(row.roas_wow, 'roas_wow'),
        is_mtd: row.is_mtd || false
      }));
      
      const { error: insertError } = await supabase
        .from('executive_weekly_reports')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`✅ Executive Weekly sync complete: ${inserted} records`);
    return { success: true, records: inserted };
    
  } catch (error) {
    console.error('❌ Error syncing executive weekly:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

async function syncPaidAds() {
  console.log('\n💰 Syncing Paid Ads Data...');
  
  const mssqlConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM paid_ads_report ORDER BY month DESC, clinic, traffic_source, campaign_type`);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('paid_ads_reports')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) throw deleteError;
    console.log('🗑️  Cleared existing data in Supabase');
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        campaign_type: row.campaign_type,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        clicks: sanitizeNumeric(row.clicks, 'clicks'),
        spend: sanitizeNumeric(row.spend, 'spend'),
        ctr: sanitizeNumeric(row.ctr, 'ctr'),
        cpc: sanitizeNumeric(row.cpc, 'cpc'),
        impressions_mom: sanitizeNumeric(row.impressions_mom, 'impressions_mom'),
        clicks_mom: sanitizeNumeric(row.clicks_mom, 'clicks_mom'),
        spend_mom: sanitizeNumeric(row.spend_mom, 'spend_mom'),
        ctr_mom: sanitizeNumeric(row.ctr_mom, 'ctr_mom'),
        cpc_mom: sanitizeNumeric(row.cpc_mom, 'cpc_mom')
      }));
      
      const { error: insertError } = await supabase
        .from('paid_ads_reports')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`✅ Paid Ads sync complete: ${inserted} records`);
    return { success: true, records: inserted };
    
  } catch (error) {
    console.error('❌ Error syncing paid ads:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

async function syncSEOChannels() {
  console.log('\n🔍 Syncing SEO Channels Data...');
  
  const mssqlConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM seo_report ORDER BY month DESC, clinic, traffic_source`);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('seo_reports')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) throw deleteError;
    console.log('🗑️  Cleared existing data in Supabase');
    
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
      console.log(`✅ Inserted ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`✅ SEO Channels sync complete: ${inserted} records`);
    return { success: true, records: inserted };
    
  } catch (error) {
    console.error('❌ Error syncing SEO channels:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

async function syncAllTables() {
  console.log('🚀 Starting Complete Database Sync with Numeric Sanitization');
  console.log('==================================================\n');
  
  const results = {
    executiveMonthly: await syncExecutiveMonthly(),
    executiveWeekly: await syncExecutiveWeekly(),
    paidAds: await syncPaidAds(),
    seoChannels: await syncSEOChannels()
  };
  
  console.log('\n📊 FINAL SYNC SUMMARY');
  console.log('====================');
  console.log(`Executive Monthly: ${results.executiveMonthly.success ? '✅ Success' : '❌ Failed'} ${results.executiveMonthly.success ? `(${results.executiveMonthly.records} records)` : `- ${results.executiveMonthly.error}`}`);
  console.log(`Executive Weekly: ${results.executiveWeekly.success ? '✅ Success' : '❌ Failed'} ${results.executiveWeekly.success ? `(${results.executiveWeekly.records} records)` : `- ${results.executiveWeekly.error}`}`);
  console.log(`Paid Ads: ${results.paidAds.success ? '✅ Success' : '❌ Failed'} ${results.paidAds.success ? `(${results.paidAds.records} records)` : `- ${results.paidAds.error}`}`);
  console.log(`SEO Channels: ${results.seoChannels.success ? '✅ Success' : '❌ Failed'} ${results.seoChannels.success ? `(${results.seoChannels.records} records)` : `- ${results.seoChannels.error}`}`);
  
  console.log('\n✨ Sync process complete!');
}

// Run the sync
syncAllTables().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});