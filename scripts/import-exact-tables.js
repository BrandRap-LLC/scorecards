const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MSSQL configuration
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
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

async function clearExistingTables() {
  console.log('🗑️  Clearing existing tables...\n');
  
  try {
    // Clear paid_ads
    await supabase.from('paid_ads').delete().gte('clinic', '');
    console.log('✅ Cleared paid_ads table');
  } catch (e) {
    console.log('paid_ads table cleared or doesn\'t exist');
  }
  
  try {
    // Clear google_ads_optimazation_report_ad
    await supabase.from('google_ads_optimazation_report_ad').delete().gte('clinic', '');
    console.log('✅ Cleared google_ads_optimazation_report_ad table');
  } catch (e) {
    console.log('google_ads_optimazation_report_ad table cleared or doesn\'t exist');
  }
}

async function importPaidAds(pool) {
  console.log('\n💰 Importing paid_ads table...');
  
  // Get ALL data from MSSQL - exact copy
  const query = `SELECT * FROM paid_ads ORDER BY month DESC, clinic, campaign`;
  
  const result = await pool.request().query(query);
  console.log(`  Found ${result.recordset.length} records in MSSQL`);
  
  if (result.recordset.length === 0) {
    return 0;
  }
  
  // Transform data to match Supabase column names (handle % columns)
  const transformedData = result.recordset.map(row => ({
    clinic: row.clinic,
    month: row.month,
    traffic_source: row.traffic_source,
    campaign: row.campaign,
    impressions: row.impressions,
    visits: row.visits,
    spend: row.spend,
    estimated_ltv_6m: row.estimated_ltv_6m,
    total_roas: row.total_roas,
    new_roas: row.new_roas,
    leads: row.leads,
    new_leads: row.new_leads,
    returning_leads: row.returning_leads,
    total_conversion: row['%total_conversion'], // Handle % column names
    new_conversion: row['%new_conversion'],
    returning_conversion: row['%returning_conversion'],
    cac_total: row.cac_total,
    cac_new: row.cac_new,
    total_estimated_revenue: row.total_estimated_revenue,
    new_estimated_revenue: row.new_estimated_revenue,
    total_appointments: row.total_appointments,
    new_appointments: row.new_appointments,
    returning_appointments: row.returning_appointments,
    total_conversations: row.total_conversations,
    new_conversations: row.new_conversations,
    returning_conversations: row.returning_conversations
  }));
  
  // Insert in batches
  const batchSize = 100;
  let totalInserted = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('paid_ads')
      .insert(batch);
    
    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
      // Try individual inserts
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('paid_ads')
          .insert(record);
        if (!singleError) totalInserted++;
      }
    } else {
      totalInserted += batch.length;
    }
    
    console.log(`  Progress: ${totalInserted}/${transformedData.length} records`);
  }
  
  console.log(`  ✅ Successfully imported ${totalInserted} paid_ads records`);
  return totalInserted;
}

async function importGoogleAds(pool) {
  console.log('\n📊 Importing google_ads_optimazation_report_ad table...');
  
  // Get ALL data from MSSQL - exact copy
  const query = `SELECT * FROM google_ads_optimazation_report_ad ORDER BY month DESC, clinic, campaign`;
  
  const result = await pool.request().query(query);
  console.log(`  Found ${result.recordset.length} records in MSSQL`);
  
  if (result.recordset.length === 0) {
    return 0;
  }
  
  // Data is already in correct format, just pass through
  const transformedData = result.recordset.map(row => ({
    clinic: row.clinic,
    month: row.month,
    campaign: row.campaign,
    campaign_id: row.campaign_id,
    adGroup: row.adGroup, // Keep camelCase as in MSSQL
    ad: row.ad,
    impressions: row.impressions,
    visits: row.visits,
    spend: row.spend,
    google_conversions: row.google_conversions,
    total_appointments: row.total_appointments,
    new_appointments: row.new_appointments,
    returning_appointments: row.returning_appointments,
    avg_appointment_rev: row.avg_appointment_rev,
    appointment_est_revenue: row.appointment_est_revenue,
    new_appointment_est_6m_revenue: row.new_appointment_est_6m_revenue,
    total_conversations: row.total_conversations,
    new_conversations: row.new_conversations,
    returning_conversations: row.returning_conversations,
    ad_type: row.ad_type,
    ad_strength: row.ad_strength,
    headline1: row.headline1,
    headline2: row.headline2,
    headline3: row.headline3,
    description1: row.description1,
    description2: row.description2,
    conversation_rate: row.conversation_rate,
    appointment_rate: row.appointment_rate,
    ctr: row.ctr,
    cpc: row.cpc,
    cpa: row.cpa
  }));
  
  // Insert in batches
  const batchSize = 100;
  let totalInserted = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('google_ads_optimazation_report_ad')
      .insert(batch);
    
    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
      // Try individual inserts
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('google_ads_optimazation_report_ad')
          .insert(record);
        if (!singleError) totalInserted++;
      }
    } else {
      totalInserted += batch.length;
    }
    
    console.log(`  Progress: ${totalInserted}/${transformedData.length} records`);
  }
  
  console.log(`  ✅ Successfully imported ${totalInserted} Google Ads records`);
  return totalInserted;
}

async function verifyImport() {
  console.log('\n📊 Verification Report:');
  console.log('=======================\n');
  
  // Verify paid_ads
  const { count: paidCount } = await supabase
    .from('paid_ads')
    .select('*', { count: 'exact', head: true });
  
  const { data: paidSample } = await supabase
    .from('paid_ads')
    .select('clinic, month, campaign, spend')
    .limit(3)
    .order('month', { ascending: false });
  
  console.log(`✅ paid_ads: ${paidCount} records`);
  console.log('  Sample records:');
  paidSample?.forEach(row => {
    console.log(`    ${row.clinic} | ${row.month} | ${row.campaign} | $${row.spend}`);
  });
  
  // Verify google_ads_optimazation_report_ad
  const { count: googleCount } = await supabase
    .from('google_ads_optimazation_report_ad')
    .select('*', { count: 'exact', head: true });
  
  const { data: googleSample } = await supabase
    .from('google_ads_optimazation_report_ad')
    .select('clinic, month, campaign, ad, spend')
    .limit(3)
    .order('month', { ascending: false });
  
  console.log(`\n✅ google_ads_optimazation_report_ad: ${googleCount} records`);
  console.log('  Sample records:');
  googleSample?.forEach(row => {
    console.log(`    ${row.clinic} | ${row.month} | ${row.campaign} | Ad: ${row.ad} | $${row.spend}`);
  });
  
  return { paidCount, googleCount };
}

async function main() {
  console.log('🚀 EXACT MSSQL to Supabase Import');
  console.log('==================================\n');
  
  console.log('📝 Note: Run this SQL first in Supabase Dashboard:');
  console.log('   File: sql/create_exact_mssql_tables.sql\n');
  
  try {
    // Step 1: Clear existing data
    await clearExistingTables();
    
    // Step 2: Connect to MSSQL
    console.log('\n📡 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Step 3: Import both tables
    const paidResults = await importPaidAds(pool);
    const googleResults = await importGoogleAds(pool);
    
    // Close connection
    await pool.close();
    
    // Step 4: Verify
    const verification = await verifyImport();
    
    console.log('\n==================================');
    console.log('✅ IMPORT COMPLETE');
    console.log('==================================');
    console.log(`Expected: paid_ads=816, google_ads=1964`);
    console.log(`Imported: paid_ads=${paidResults}, google_ads=${googleResults}`);
    console.log(`Verified: paid_ads=${verification.paidCount}, google_ads=${verification.googleCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();