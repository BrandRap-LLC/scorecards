#!/usr/bin/env node

/**
 * Migration Script: MSSQL executive_report_new_month to Supabase
 * This script migrates monthly executive report data from MSSQL to Supabase
 * It creates new tables without affecting existing Supabase data
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
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000
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
// This maps MSSQL column names to our standardized metric codes
const metricMapping = {
  // Revenue Metrics
  'monthly_revenue': 'monthly_revenue',
  'net_revenue': 'net_revenue',
  'gross_revenue': 'gross_revenue',
  'service_revenue': 'service_revenue',
  'product_revenue': 'product_revenue',
  'recurring_revenue': 'recurring_revenue',
  'non_recurring_revenue': 'non_recurring_revenue',
  'refunds': 'refunds',
  'discounts': 'discounts',
  
  // Customer Metrics
  'total_customers': 'total_customers',
  'new_customers': 'new_customers',
  'returning_customers': 'returning_customers',
  'active_customers': 'active_customers',
  'customer_retention_rate': 'customer_retention_rate',
  'customer_churn_rate': 'customer_churn_rate',
  'customer_lifetime_value': 'customer_lifetime_value',
  'average_customer_value': 'average_customer_value',
  
  // Operations Metrics
  'total_appointments': 'total_appointments',
  'completed_appointments': 'completed_appointments',
  'cancelled_appointments': 'cancelled_appointments',
  'no_show_appointments': 'no_show_appointments',
  'appointment_show_rate': 'appointment_show_rate',
  'utilization_rate': 'utilization_rate',
  'average_ticket_size': 'average_ticket_size',
  'services_per_customer': 'services_per_customer',
  
  // Marketing Metrics
  'marketing_spend': 'marketing_spend',
  'total_leads': 'total_leads',
  'qualified_leads': 'qualified_leads',
  'lead_conversion_rate': 'lead_conversion_rate',
  'cost_per_lead': 'cost_per_lead',
  'cost_per_acquisition': 'cost_per_acquisition',
  'marketing_roi': 'marketing_roi',
  
  // Staff Metrics
  'total_staff': 'total_staff',
  'staff_utilization': 'staff_utilization',
  'revenue_per_staff': 'revenue_per_staff',
  'staff_retention_rate': 'staff_retention_rate',
  
  // Financial Metrics
  'gross_profit': 'gross_profit',
  'gross_margin': 'gross_margin',
  'operating_profit': 'operating_profit',
  'operating_margin': 'operating_margin',
  'ebitda': 'ebitda',
  'cash_flow': 'cash_flow',
  
  // Quality Metrics
  'nps_score': 'nps_score',
  'customer_satisfaction': 'customer_satisfaction',
  'google_rating': 'google_rating',
  'review_count': 'review_count',
  'complaints': 'complaints',
  'complaint_resolution_rate': 'complaint_resolution_rate'
};

// Progress tracking
let stats = {
  totalRecords: 0,
  processedRecords: 0,
  skippedRecords: 0,
  errorRecords: 0,
  companies: new Set(),
  metrics: new Set(),
  months: new Set()
};

async function migrateData() {
  let mssqlConnection;
  
  try {
    console.log('🚀 Starting Executive Monthly Report Migration\n');
    console.log('📊 Source: MSSQL executive_report_new_month');
    console.log('🎯 Target: Supabase executive_monthly_data\n');
    
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlConnection = await sql.connect(config.mssql);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch data from MSSQL
    console.log('📥 Fetching data from executive_report_new_month...');
    const query = `
      SELECT TOP 5000 *
      FROM [${process.env.MSSQL_DATABASE}].[dbo].[executive_report_new_month]
      ORDER BY year DESC, month DESC, company_name
    `;
    
    const result = await mssqlConnection.request().query(query);
    stats.totalRecords = result.recordset.length;
    
    console.log(`✅ Fetched ${stats.totalRecords} records from MSSQL\n`);
    
    if (stats.totalRecords === 0) {
      console.log('⚠️  No data found in executive_report_new_month table');
      return;
    }
    
    // Get or create companies
    console.log('🏢 Processing companies...');
    const companies = await processCompanies(result.recordset);
    console.log(`✅ Processed ${companies.size} unique companies\n`);
    
    // Get metrics from Supabase
    console.log('📈 Fetching metric definitions from Supabase...');
    const metrics = await getMetrics();
    console.log(`✅ Found ${Object.keys(metrics).length} metric definitions\n`);
    
    // Process and prepare monthly data
    console.log('💾 Processing monthly data...');
    const monthlyData = await processMonthlyData(result.recordset, companies, metrics);
    console.log(`✅ Prepared ${monthlyData.length} data records\n`);
    
    // Upload to Supabase
    console.log('📤 Uploading to Supabase...');
    await uploadToSupabase(monthlyData);
    
    // Print summary
    printSummary();
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  } finally {
    if (mssqlConnection) {
      await mssqlConnection.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

async function processCompanies(records) {
  const companyMap = new Map();
  const uniqueCompanies = new Set();
  
  // Extract unique company names
  records.forEach(record => {
    if (record.company_name) {
      uniqueCompanies.add(record.company_name);
      stats.companies.add(record.company_name);
    }
  });
  
  // Get existing companies from Supabase
  const { data: existingCompanies, error } = await supabase
    .from('companies')
    .select('*');
  
  if (error) {
    console.error('Error fetching companies:', error);
    return companyMap;
  }
  
  // Create map of existing companies
  existingCompanies?.forEach(company => {
    companyMap.set(company.company_name, company.id);
  });
  
  // Insert new companies if they don't exist
  const newCompanies = [];
  for (const companyName of uniqueCompanies) {
    if (!companyMap.has(companyName)) {
      // Generate display name from company name
      const displayName = companyName
        .replace(/_/g, ' ')
        .replace(/\./g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      newCompanies.push({
        company_name: companyName,
        display_name: displayName,
        is_active: true
      });
    }
  }
  
  if (newCompanies.length > 0) {
    console.log(`  📝 Creating ${newCompanies.length} new companies...`);
    const { data: insertedCompanies, error } = await supabase
      .from('companies')
      .insert(newCompanies)
      .select();
    
    if (error) {
      console.error('Error inserting companies:', error);
    } else {
      insertedCompanies?.forEach(company => {
        companyMap.set(company.company_name, company.id);
      });
      console.log(`  ✅ Created ${insertedCompanies.length} new companies`);
    }
  }
  
  return companyMap;
}

async function getMetrics() {
  const metricMap = {};
  
  const { data: metrics, error } = await supabase
    .from('executive_monthly_metrics')
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

async function processMonthlyData(records, companies, metrics) {
  const monthlyData = [];
  const processedKeys = new Set();
  
  console.log('  📊 Processing records...');
  let processedCount = 0;
  
  for (const record of records) {
    const companyId = companies.get(record.company_name);
    if (!companyId) {
      stats.skippedRecords++;
      continue;
    }
    
    const year = record.year;
    const month = record.month;
    
    // Track unique months
    stats.months.add(`${year}-${String(month).padStart(2, '0')}`);
    
    // Process each metric column
    for (const [mssqlColumn, metricCode] of Object.entries(metricMapping)) {
      const metricId = metrics[metricCode];
      if (!metricId) continue;
      
      // Create unique key to avoid duplicates
      const key = `${companyId}-${metricId}-${year}-${month}`;
      if (processedKeys.has(key)) continue;
      processedKeys.add(key);
      
      // Get the value from the record
      const value = record[mssqlColumn];
      if (value === null || value === undefined) continue;
      
      // Track metrics being migrated
      stats.metrics.add(metricCode);
      
      // Create the data record
      monthlyData.push({
        company_id: companyId,
        metric_id: metricId,
        year: year,
        month: month,
        value: parseFloat(value) || 0,
        is_estimated: false,
        is_final: true,
        data_source: 'MSSQL_MIGRATION',
        imported_at: new Date().toISOString()
      });
      
      processedCount++;
      if (processedCount % 1000 === 0) {
        process.stdout.write(`\r  📊 Processed ${processedCount} data points...`);
      }
    }
    
    stats.processedRecords++;
  }
  
  console.log(`\r  ✅ Processed ${processedCount} total data points`);
  return monthlyData;
}

async function uploadToSupabase(monthlyData) {
  const batchSize = 500; // Smaller batch size for safety
  let uploaded = 0;
  let errors = 0;
  
  console.log(`  📤 Uploading ${monthlyData.length} records in batches of ${batchSize}...`);
  
  for (let i = 0; i < monthlyData.length; i += batchSize) {
    const batch = monthlyData.slice(i, i + batchSize);
    
    try {
      // Upsert data (insert or update if exists)
      const { error } = await supabase
        .from('executive_monthly_data')
        .upsert(batch, {
          onConflict: 'company_id,metric_id,year,month',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`\n  ❌ Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errors += batch.length;
        stats.errorRecords += batch.length;
      } else {
        uploaded += batch.length;
        process.stdout.write(`\r  📤 Uploaded ${uploaded}/${monthlyData.length} records...`);
      }
    } catch (err) {
      console.error(`\n  ❌ Unexpected error in batch ${Math.floor(i / batchSize) + 1}:`, err.message);
      errors += batch.length;
      stats.errorRecords += batch.length;
    }
  }
  
  console.log(`\n  ✅ Successfully uploaded ${uploaded} records`);
  if (errors > 0) {
    console.log(`  ⚠️  Failed to upload ${errors} records`);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Records Fetched:  ${stats.totalRecords}`);
  console.log(`Records Processed:      ${stats.processedRecords}`);
  console.log(`Records Skipped:        ${stats.skippedRecords}`);
  console.log(`Records with Errors:    ${stats.errorRecords}`);
  console.log(`Unique Companies:       ${stats.companies.size}`);
  console.log(`Unique Metrics:         ${stats.metrics.size}`);
  console.log(`Unique Months:          ${stats.months.size}`);
  
  if (stats.months.size > 0) {
    const monthsArray = Array.from(stats.months).sort();
    console.log(`Date Range:             ${monthsArray[0]} to ${monthsArray[monthsArray.length - 1]}`);
  }
  
  console.log('='.repeat(60));
  
  if (stats.errorRecords === 0) {
    console.log('✨ Migration completed successfully!');
  } else {
    console.log('⚠️  Migration completed with some errors. Please review the logs.');
  }
}

// Helper function to validate environment variables
function validateEnvironment() {
  const required = [
    'MSSQL_SERVER',
    'MSSQL_DATABASE',
    'MSSQL_USERNAME',
    'MSSQL_PASSWORD',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env.local file');
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  console.log('🔄 Executive Monthly Report Migration Tool');
  console.log('==========================================\n');
  
  // Validate environment
  validateEnvironment();
  
  // Run migration
  migrateData()
    .then(() => {
      console.log('\n🎉 Migration process completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };