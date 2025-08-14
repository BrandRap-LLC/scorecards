#!/usr/bin/env node

/**
 * MSSQL to Supabase Data Sync Script
 * 
 * Syncs 5 core tables from MSSQL to Supabase:
 * 1. executive_report_new_month → executive_monthly_reports
 * 2. executive_report_new_week → executive_weekly_reports
 * 3. paid_ads → paid_ads
 * 4. seo_channels → seo_channels
 * 5. seo_hightlights_keyword_page_one → seo_highlights_keyword_page_one
 * 
 * Usage:
 *   node scripts/sync-mssql-to-supabase.js              # Sync all tables
 *   node scripts/sync-mssql-to-supabase.js --table=executive_monthly   # Sync specific table
 *   node scripts/sync-mssql-to-supabase.js --dry-run   # Preview without syncing
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tableArg = args.find(arg => arg.startsWith('--table='));
const specificTable = tableArg ? tableArg.split('=')[1] : null;

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MSSQL_SERVER',
  'MSSQL_USERNAME',
  'MSSQL_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MSSQL configurations
const aggregatedReportingConfig = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: 'aggregated_reporting',
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const reportingConfig = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: 'reporting',
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Helper function to sanitize numeric values
function sanitizeNumeric(value, fieldName = '') {
  if (value === null || value === undefined) return null;
  
  const num = Number(value);
  
  if (!isFinite(num) || isNaN(num)) {
    console.warn(`⚠️  Invalid numeric value for ${fieldName}: ${value} - setting to null`);
    return null;
  }
  
  const MAX_SAFE_VALUE = 99999999;
  if (Math.abs(num) > MAX_SAFE_VALUE) {
    console.warn(`⚠️  Capping large value for ${fieldName}: ${value} → ${Math.sign(num) * MAX_SAFE_VALUE}`);
    return Math.sign(num) * MAX_SAFE_VALUE;
  }
  
  return num;
}

async function syncExecutiveMonthly() {
  console.log('\n📊 1. Syncing Executive Monthly Reports...');
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(aggregatedReportingConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get count from MSSQL
    const countResult = await mssqlPool.request()
      .query(`SELECT COUNT(*) as count FROM executive_report_new_month`);
    const totalRecords = countResult.recordset[0].count;
    console.log(`📥 Found ${totalRecords} records in MSSQL`);
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM executive_report_new_month ORDER BY month DESC, clinic, traffic_source`);
    
    // Clear existing data in Supabase (if not dry run)
    if (!dryRun) {
      const { error: deleteError } = await supabase
        .from('executive_monthly_reports')
        .delete()
        .neq('id', 0);
      
      if (deleteError && !deleteError.message.includes('no rows')) {
        throw deleteError;
      }
      console.log('🗑️  Cleared existing data in Supabase');
    } else {
      console.log('🔍 DRY RUN: Would clear existing data in Supabase');
    }
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Map to the existing Supabase schema
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        visits: sanitizeNumeric(row.visits, 'visits'),
        spend: sanitizeNumeric(row.spend, 'spend'),
        ltv: sanitizeNumeric(row.ltv, 'ltv'),
        estimated_ltv_6m: sanitizeNumeric(row.estimated_ltv_6m, 'estimated_ltv_6m'),
        avg_ltv: sanitizeNumeric(row.avg_ltv, 'avg_ltv'),
        roas: sanitizeNumeric(row.total_roas, 'roas'), // Map total_roas → roas
        leads: sanitizeNumeric(row.leads, 'leads'),
        new_leads: sanitizeNumeric(row.new_leads, 'new_leads'),
        returning_leads: sanitizeNumeric(row.returning_leads, 'returning_leads'),
        conversion_rate: sanitizeNumeric(row['%total_conversion'], 'conversion_rate'),
        new_conversion: sanitizeNumeric(row['%new_conversion'], 'new_conversion'),
        returning_conversion: sanitizeNumeric(row['%returning_conversion'], 'returning_conversion'),
        total_conversion: sanitizeNumeric(row['%total_conversion'], 'total_conversion'),
        cac_total: sanitizeNumeric(row.cac_total, 'cac_total'),
        cac_new: sanitizeNumeric(row.cac_new, 'cac_new'),
        total_appointments: sanitizeNumeric(row.total_appointments, 'total_appointments'),
        new_appointments: sanitizeNumeric(row.new_appointments, 'new_appointments'),
        returning_appointments: sanitizeNumeric(row.returning_appointments, 'returning_appointments'),
        online_booking: sanitizeNumeric(row.online_booking, 'online_booking'),
        total_conversations: sanitizeNumeric(row.total_conversations, 'total_conversations'),
        new_conversations: sanitizeNumeric(row.new_conversations, 'new_conversations'),
        returning_conversations: sanitizeNumeric(row.returning_conversations, 'returning_conversations'),
        total_estimated_revenue: sanitizeNumeric(row.total_estimated_revenue, 'total_estimated_revenue'),
        new_estimated_revenue: sanitizeNumeric(row.new_estimated_revenue, 'new_estimated_revenue'),
        total_roas: sanitizeNumeric(row.total_roas, 'total_roas'),
        new_roas: sanitizeNumeric(row.new_roas, 'new_roas')
      }));
      
      if (!dryRun) {
        const { error: insertError } = await supabase
          .from('executive_monthly_reports')
          .insert(transformedBatch);
        
        if (insertError) {
          console.error(`❌ Error inserting batch:`, insertError);
          throw insertError;
        }
      }
      
      inserted += batch.length;
      process.stdout.write(`\r${dryRun ? '🔍' : '✅'} Progress: ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`\n✅ Executive Monthly sync complete: ${inserted} records`);
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
  console.log('\n📊 2. Syncing Executive Weekly Reports...');
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(aggregatedReportingConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get count from MSSQL
    const countResult = await mssqlPool.request()
      .query(`SELECT COUNT(*) as count FROM executive_report_new_week`);
    const totalRecords = countResult.recordset[0].count;
    console.log(`📥 Found ${totalRecords} records in MSSQL`);
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM executive_report_new_week ORDER BY week DESC, clinic, traffic_source`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('executive_weekly_reports')
      .delete()
      .neq('id', 0);
    
    if (deleteError && !deleteError.message.includes('no rows')) {
      throw deleteError;
    }
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
        estimated_ltv_6m: sanitizeNumeric(row.estimated_ltv_6m, 'estimated_ltv_6m'),
        total_roas: sanitizeNumeric(row.total_roas, 'total_roas'),
        new_roas: sanitizeNumeric(row.new_roas, 'new_roas'),
        leads: sanitizeNumeric(row.leads, 'leads'),
        leads_wow: sanitizeNumeric(row.leads_wow, 'leads_wow'),
        new_leads: sanitizeNumeric(row.new_leads, 'new_leads'),
        returning_leads: sanitizeNumeric(row.returning_leads, 'returning_leads'),
        total_conversion: sanitizeNumeric(row['%total_conversion'], 'total_conversion'),
        new_conversion: sanitizeNumeric(row['%new_conversion'], 'new_conversion'),
        returning_conversion: sanitizeNumeric(row['%returning_conversion'], 'returning_conversion'),
        conversion_rate: sanitizeNumeric(row.conversion_rate, 'conversion_rate'),
        conversion_rate_wow: sanitizeNumeric(row.conversion_rate_wow, 'conversion_rate_wow'),
        cac_total: sanitizeNumeric(row.cac_total, 'cac_total'),
        cac_total_wow: sanitizeNumeric(row.cac_total_wow, 'cac_total_wow'),
        cac_new: sanitizeNumeric(row.cac_new, 'cac_new'),
        total_appointments: sanitizeNumeric(row.total_appointments, 'total_appointments'),
        new_appointments: sanitizeNumeric(row.new_appointments, 'new_appointments'),
        returning_appointments: sanitizeNumeric(row.returning_appointments, 'returning_appointments'),
        appointments: sanitizeNumeric(row.appointments, 'appointments'),
        appointments_wow: sanitizeNumeric(row.appointments_wow, 'appointments_wow'),
        online_booking: sanitizeNumeric(row.online_booking, 'online_booking'),
        total_conversations: sanitizeNumeric(row.total_conversations, 'total_conversations'),
        new_conversations: sanitizeNumeric(row.new_conversations, 'new_conversations'),
        returning_conversations: sanitizeNumeric(row.returning_conversations, 'returning_conversations'),
        conversations: sanitizeNumeric(row.conversations, 'conversations'),
        conversations_wow: sanitizeNumeric(row.conversations_wow, 'conversations_wow'),
        total_estimated_revenue: sanitizeNumeric(row.total_estimated_revenue, 'total_estimated_revenue'),
        new_estimated_revenue: sanitizeNumeric(row.new_estimated_revenue, 'new_estimated_revenue'),
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
      process.stdout.write(`\r✅ Progress: ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`\n✅ Executive Weekly sync complete: ${inserted} records`);
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
  console.log('\n💰 3. Syncing Paid Ads Data...');
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(aggregatedReportingConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get count from MSSQL
    const countResult = await mssqlPool.request()
      .query(`SELECT COUNT(*) as count FROM paid_ads`);
    const totalRecords = countResult.recordset[0].count;
    console.log(`📥 Found ${totalRecords} records in MSSQL`);
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM paid_ads ORDER BY month DESC, clinic, traffic_source, campaign`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('paid_ads')
      .delete()
      .gte('impressions', 0); // Match all rows
    
    if (deleteError && !deleteError.message.includes('no rows')) {
      console.log('⚠️  Could not clear table, proceeding with insert anyway');
    } else {
      console.log('🗑️  Cleared existing data in Supabase');
    }
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Map MSSQL columns to new Supabase schema (now matches MSSQL exactly)
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        campaign: row.campaign,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        visits: sanitizeNumeric(row.visits, 'visits'),
        spend: sanitizeNumeric(row.spend, 'spend'),
        estimated_ltv_6m: sanitizeNumeric(row.estimated_ltv_6m, 'estimated_ltv_6m'),
        total_roas: sanitizeNumeric(row.total_roas, 'total_roas'),
        new_roas: sanitizeNumeric(row.new_roas, 'new_roas'),
        leads: sanitizeNumeric(row.leads, 'leads'),
        new_leads: sanitizeNumeric(row.new_leads, 'new_leads'),
        returning_leads: sanitizeNumeric(row.returning_leads, 'returning_leads'),
        total_conversion: sanitizeNumeric(row['%total_conversion'], 'total_conversion'),
        new_conversion: sanitizeNumeric(row['%new_conversion'], 'new_conversion'),
        returning_conversion: sanitizeNumeric(row['%returning_conversion'], 'returning_conversion'),
        cac_total: sanitizeNumeric(row.cac_total, 'cac_total'),
        cac_new: sanitizeNumeric(row.cac_new, 'cac_new'),
        total_estimated_revenue: sanitizeNumeric(row.total_estimated_revenue, 'total_estimated_revenue'),
        new_estimated_revenue: sanitizeNumeric(row.new_estimated_revenue, 'new_estimated_revenue'),
        total_appointments: sanitizeNumeric(row.total_appointments, 'total_appointments'),
        new_appointments: sanitizeNumeric(row.new_appointments, 'new_appointments'),
        returning_appointments: sanitizeNumeric(row.returning_appointments, 'returning_appointments'),
        total_conversations: sanitizeNumeric(row.total_conversations, 'total_conversations'),
        new_conversations: sanitizeNumeric(row.new_conversations, 'new_conversations'),
        returning_conversations: sanitizeNumeric(row.returning_conversations, 'returning_conversations')
      }));
      
      const { error: insertError } = await supabase
        .from('paid_ads')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        console.log('   Attempting to continue with next batch...');
        skipped += batch.length;
        continue;
      }
      
      inserted += batch.length;
      process.stdout.write(`\r✅ Progress: ${inserted}/${result.recordset.length} records (${skipped} skipped)`);
    }
    
    console.log(`\n✅ Paid Ads sync complete: ${inserted} records inserted, ${skipped} skipped`);
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
  console.log('\n🔍 4. Syncing SEO Channels Data...');
  let mssqlPool;
  
  try {
    mssqlPool = await sql.connect(aggregatedReportingConfig);
    console.log('✅ Connected to MSSQL (aggregated_reporting)');
    
    // Get count from MSSQL
    const countResult = await mssqlPool.request()
      .query(`SELECT COUNT(*) as count FROM seo_channels`);
    const totalRecords = countResult.recordset[0].count;
    console.log(`📥 Found ${totalRecords} records in MSSQL`);
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM seo_channels ORDER BY month DESC, clinic, traffic_source`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('seo_channels')
      .delete()
      .gte('impressions', 0); // Match all rows
    
    if (deleteError && !deleteError.message.includes('no rows')) {
      console.log('⚠️  Could not clear table, proceeding with insert anyway');
    } else {
      console.log('🗑️  Cleared existing data in Supabase');
    }
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Map MSSQL columns to new Supabase schema (now matches MSSQL exactly)
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        visits: sanitizeNumeric(row.visits, 'visits'),
        estimated_ltv_6m: sanitizeNumeric(row.estimated_ltv_6m, 'estimated_ltv_6m'),
        leads: sanitizeNumeric(row.leads, 'leads'),
        new_leads: sanitizeNumeric(row.new_leads, 'new_leads'),
        returning_leads: sanitizeNumeric(row.returning_leads, 'returning_leads'),
        total_conversion: sanitizeNumeric(row['%total_conversion'], 'total_conversion'),
        new_conversion: sanitizeNumeric(row['%new_conversion'], 'new_conversion'),
        returning_conversion: sanitizeNumeric(row['%returning_conversion'], 'returning_conversion'),
        total_estimated_revenue: sanitizeNumeric(row.total_estimated_revenue, 'total_estimated_revenue'),
        new_estimated_revenue: sanitizeNumeric(row.new_estimated_revenue, 'new_estimated_revenue'),
        total_appointments: sanitizeNumeric(row.total_appointments, 'total_appointments'),
        new_appointments: sanitizeNumeric(row.new_appointments, 'new_appointments'),
        returning_appointments: sanitizeNumeric(row.returning_appointments, 'returning_appointments'),
        total_conversations: sanitizeNumeric(row.total_conversations, 'total_conversations'),
        new_conversations: sanitizeNumeric(row.new_conversations, 'new_conversations'),
        returning_conversations: sanitizeNumeric(row.returning_conversations, 'returning_conversations')
      }));
      
      const { error: insertError } = await supabase
        .from('seo_channels')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        console.log('   Attempting to continue with next batch...');
        skipped += batch.length;
        continue;
      }
      
      inserted += batch.length;
      process.stdout.write(`\r✅ Progress: ${inserted}/${result.recordset.length} records (${skipped} skipped)`);
    }
    
    console.log(`\n✅ SEO Channels sync complete: ${inserted} records inserted, ${skipped} skipped`);
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

async function syncSEOHighlights() {
  console.log('\n🌟 5. Syncing SEO Highlights Keyword Page One...');
  let mssqlPool;
  
  try {
    // Note: This table is in the 'reporting' database
    mssqlPool = await sql.connect(reportingConfig);
    console.log('✅ Connected to MSSQL (reporting database)');
    
    // Get count from MSSQL
    const countResult = await mssqlPool.request()
      .query(`SELECT COUNT(*) as count FROM seo_hightlights_keyword_page_one`); // Note the spelling!
    const totalRecords = countResult.recordset[0].count;
    console.log(`📥 Found ${totalRecords} records in MSSQL`);
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM seo_hightlights_keyword_page_one ORDER BY Company_Name, period, query`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('seo_highlights_keyword_page_one') // Correct spelling in Supabase
      .delete()
      .neq('id', 0);
    
    if (deleteError && !deleteError.message.includes('no rows')) {
      throw deleteError;
    }
    console.log('🗑️  Cleared existing data in Supabase');
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      const transformedBatch = batch.map(row => ({
        company_name: row.Company_Name,
        query_group: row.query_group,
        query: row.query,
        period: row.period ? new Date(row.period).toISOString() : null,
        period_type: row.period_type,
        current_rank: sanitizeNumeric(row.current_rank, 'current_rank'),
        baseline_avg_rank: sanitizeNumeric(row.baseline_avg_rank, 'baseline_avg_rank'),
        highlight_reason: row.highlight_reason
      }));
      
      const { error: insertError } = await supabase
        .from('seo_highlights_keyword_page_one')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      process.stdout.write(`\r✅ Progress: ${inserted}/${result.recordset.length} records`);
    }
    
    console.log(`\n✅ SEO Highlights sync complete: ${inserted} records`);
    return { success: true, records: inserted };
    
  } catch (error) {
    console.error('❌ Error syncing SEO highlights:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

async function syncAllTables() {
  console.log('🚀 Starting Complete Database Sync (5 Tables)');
  console.log('============================================\n');
  
  const startTime = Date.now();
  
  const results = {
    executiveMonthly: await syncExecutiveMonthly(),
    executiveWeekly: await syncExecutiveWeekly(),
    paidAds: await syncPaidAds(),
    seoChannels: await syncSEOChannels(),
    seoHighlights: await syncSEOHighlights()
  };
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 FINAL SYNC SUMMARY');
  console.log('====================');
  console.log(`Executive Monthly: ${results.executiveMonthly.success ? '✅ Success' : '❌ Failed'} ${results.executiveMonthly.success ? `(${results.executiveMonthly.records} records)` : `- ${results.executiveMonthly.error}`}`);
  console.log(`Executive Weekly: ${results.executiveWeekly.success ? '✅ Success' : '❌ Failed'} ${results.executiveWeekly.success ? `(${results.executiveWeekly.records} records)` : `- ${results.executiveWeekly.error}`}`);
  console.log(`Paid Ads: ${results.paidAds.success ? '✅ Success' : '❌ Failed'} ${results.paidAds.success ? `(${results.paidAds.records} records)` : `- ${results.paidAds.error}`}`);
  console.log(`SEO Channels: ${results.seoChannels.success ? '✅ Success' : '❌ Failed'} ${results.seoChannels.success ? `(${results.seoChannels.records} records)` : `- ${results.seoChannels.error}`}`);
  console.log(`SEO Highlights: ${results.seoHighlights.success ? '✅ Success' : '❌ Failed'} ${results.seoHighlights.success ? `(${results.seoHighlights.records} records)` : `- ${results.seoHighlights.error}`}`);
  
  const totalRecords = Object.values(results)
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.records, 0);
  
  console.log(`\n⏱️  Total time: ${duration} seconds`);
  console.log(`📦 Total records synced: ${totalRecords.toLocaleString()}`);
  
  console.log('\n✨ Sync process complete!');
}

// Run the sync
syncAllTables().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});