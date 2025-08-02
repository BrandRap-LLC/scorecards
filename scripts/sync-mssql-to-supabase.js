#!/usr/bin/env node

/**
 * Data Sync Script: MSSQL to Supabase
 * Syncs weekly scorecard data from MSSQL to Supabase
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  mssql: {
    server: process.env.MSSQL_SERVER,
    port: parseInt(process.env.MSSQL_PORT || '1433'),
    database: process.env.MSSQL_DATABASE,
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// Initialize Supabase client with service role key
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// Metric mapping from MSSQL columns to metric codes
const metricMapping = {
  // Revenue Metrics
  'net_sales': 'net_sales',
  'gross_sales': 'gross_sales',
  'service_revenue': 'service_revenue',
  'product_revenue': 'product_revenue',
  'refunds': 'refunds',
  
  // Customer Metrics
  'new_customers': 'new_customers',
  'returning_customers': 'returning_customers',
  'total_customers': 'total_customers',
  'retention_rate': 'retention_rate',
  'churn_rate': 'churn_rate',
  
  // Operations Metrics
  'appointments': 'appointments',
  'show_rate': 'show_rate',
  'utilization_rate': 'utilization',
  'average_ticket': 'average_ticket',
  'treatments_per_customer': 'treatments_per_customer',
  
  // Marketing Metrics
  'leads': 'leads',
  'conversion_rate': 'conversion_rate',
  'cost_per_lead': 'cost_per_lead',
  'marketing_spend': 'marketing_spend',
  'roi': 'roi',
  
  // Staff Metrics
  'staff_count': 'staff_count',
  'revenue_per_staff': 'revenue_per_staff',
  'staff_productivity': 'staff_productivity',
  
  // Quality Metrics
  'nps_score': 'nps_score',
  'customer_satisfaction': 'customer_satisfaction',
  'google_rating': 'google_rating',
  'complaints': 'complaints'
};

async function syncData() {
  let mssqlConnection;
  
  try {
    console.log('🔄 Starting data sync from MSSQL to Supabase...\n');
    
    // Connect to MSSQL
    console.log('📊 Connecting to MSSQL...');
    mssqlConnection = await sql.connect(config.mssql);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch data from MSSQL
    console.log('📥 Fetching data from MSSQL table:', process.env.MSSQL_TABLE);
    const result = await mssqlConnection.request()
      .query(`
        SELECT TOP 1000 *
        FROM [${process.env.MSSQL_DATABASE}].[dbo].[${process.env.MSSQL_TABLE}]
        ORDER BY year DESC, week_number DESC
      `);
    
    console.log(`✅ Fetched ${result.recordset.length} records from MSSQL\n`);
    
    if (result.recordset.length === 0) {
      console.log('⚠️  No data found in MSSQL table');
      return;
    }
    
    // Get or create companies in Supabase
    console.log('🏢 Processing companies...');
    const companies = await processCompanies(result.recordset);
    console.log(`✅ Processed ${Object.keys(companies).length} companies\n`);
    
    // Get metrics from Supabase
    console.log('📈 Fetching metrics from Supabase...');
    const metrics = await getMetrics();
    console.log(`✅ Found ${Object.keys(metrics).length} metrics\n`);
    
    // Process and insert weekly data
    console.log('💾 Processing weekly data...');
    const weeklyData = await processWeeklyData(result.recordset, companies, metrics);
    console.log(`✅ Processed ${weeklyData.length} weekly records\n`);
    
    // Insert data into Supabase
    console.log('📤 Uploading to Supabase...');
    await uploadToSupabase(weeklyData);
    
    console.log('\n✨ Data sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  } finally {
    if (mssqlConnection) {
      await mssqlConnection.close();
    }
  }
}

async function processCompanies(records) {
  const companyMap = {};
  const uniqueCompanies = new Set();
  
  // Extract unique company names
  records.forEach(record => {
    if (record.company_name) {
      uniqueCompanies.add(record.company_name);
    }
  });
  
  // Get existing companies from Supabase
  const { data: existingCompanies } = await supabase
    .from('companies')
    .select('*');
  
  // Create map of existing companies
  existingCompanies?.forEach(company => {
    companyMap[company.company_name] = company.id;
  });
  
  // Insert new companies
  const newCompanies = [];
  for (const companyName of uniqueCompanies) {
    if (!companyMap[companyName]) {
      const displayName = companyName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      newCompanies.push({
        company_name: companyName,
        display_name: displayName
      });
    }
  }
  
  if (newCompanies.length > 0) {
    const { data: insertedCompanies, error } = await supabase
      .from('companies')
      .insert(newCompanies)
      .select();
    
    if (error) {
      console.error('Error inserting companies:', error);
    } else {
      insertedCompanies?.forEach(company => {
        companyMap[company.company_name] = company.id;
      });
    }
  }
  
  return companyMap;
}

async function getMetrics() {
  const metricMap = {};
  
  const { data: metrics, error } = await supabase
    .from('scorecards_metrics')
    .select('*');
  
  if (error) {
    console.error('Error fetching metrics:', error);
    return metricMap;
  }
  
  metrics?.forEach(metric => {
    metricMap[metric.metric_code] = metric.id;
  });
  
  return metricMap;
}

async function processWeeklyData(records, companies, metrics) {
  const weeklyData = [];
  const processedKeys = new Set();
  
  for (const record of records) {
    const companyId = companies[record.company_name];
    if (!companyId) continue;
    
    const year = record.year;
    const weekNumber = record.week_number;
    
    // Process each metric column
    for (const [mssqlColumn, metricCode] of Object.entries(metricMapping)) {
      const metricId = metrics[metricCode];
      if (!metricId) continue;
      
      // Create unique key to avoid duplicates
      const key = `${companyId}-${metricId}-${year}-${weekNumber}`;
      if (processedKeys.has(key)) continue;
      processedKeys.add(key);
      
      const value = record[mssqlColumn];
      if (value === null || value === undefined) continue;
      
      // Calculate week-over-week change
      let wowChange = null;
      let wowPercent = null;
      
      // For now, we'll set these to null - in production, you'd calculate from previous week
      // This would require fetching the previous week's data
      
      weeklyData.push({
        company_id: companyId,
        metric_id: metricId,
        year: year,
        week_number: weekNumber,
        week_start_date: record.week_start_date || new Date(year, 0, (weekNumber - 1) * 7 + 1).toISOString().split('T')[0],
        week_end_date: record.week_end_date || new Date(year, 0, (weekNumber - 1) * 7 + 7).toISOString().split('T')[0],
        value: parseFloat(value) || 0,
        trending_value: null,
        is_mtd: record.is_mtd || false,
        is_complete: !record.is_mtd,
        wow_change: wowChange,
        wow_percent: wowPercent,
        four_week_avg: null,
        twelve_week_avg: null
      });
    }
  }
  
  return weeklyData;
}

async function uploadToSupabase(weeklyData) {
  const batchSize = 100;
  let uploaded = 0;
  
  for (let i = 0; i < weeklyData.length; i += batchSize) {
    const batch = weeklyData.slice(i, i + batchSize);
    
    // Upsert data (insert or update if exists)
    const { error } = await supabase
      .from('scorecards_weekly')
      .upsert(batch, {
        onConflict: 'company_id,metric_id,year,week_number',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error(`Error uploading batch ${i / batchSize + 1}:`, error);
    } else {
      uploaded += batch.length;
      process.stdout.write(`\r📤 Uploaded ${uploaded}/${weeklyData.length} records`);
    }
  }
  
  console.log(`\n✅ Successfully uploaded ${uploaded} records to Supabase`);
}

// Calculate WoW changes (separate function for batch processing)
async function calculateWoWChanges() {
  console.log('\n📊 Calculating week-over-week changes...');
  
  // This would be a separate process that:
  // 1. Fetches all weekly data ordered by company, metric, year, week
  // 2. Calculates WoW changes for each metric
  // 3. Updates the records with calculated values
  
  // For now, this is a placeholder
  console.log('✅ WoW calculations complete (placeholder)');
}

// Run the sync
if (require.main === module) {
  syncData()
    .then(() => {
      console.log('\n🎉 Sync process completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncData };