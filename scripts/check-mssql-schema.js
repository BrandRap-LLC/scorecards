#!/usr/bin/env node

const sql = require('mssql');

const config = {
  server: '54.245.209.65',
  port: 1433,
  database: 'aggregated_reporting',
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkSchema() {
  try {
    const pool = await sql.connect(config);
    
    console.log('🔍 MSSQL Schema Analysis: executive_report_new_month');
    console.log('=====================================================\n');
    
    // Get schema
    const schemaResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'executive_report_new_month' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Table Schema:');
    console.log('----------------');
    
    const oldColumns = [
      'clinic', 'month', 'traffic_source', 'impressions', 'visits', 'spend',
      'ltv', 'estimated_ltv_6m', 'avg_ltv', 'roas', 'leads', '%conversion',
      'cac_total', 'cac_new', 'total_appointments', 'new_appointments',
      'returning_appointments', 'online_booking', 'total_conversations',
      'new_conversations', 'returning_conversations'
    ];
    
    const currentColumns = schemaResult.recordset.map(r => r.COLUMN_NAME);
    
    console.log('\n🆕 NEW Columns (not in our Supabase table):');
    const newColumns = currentColumns.filter(c => !oldColumns.includes(c) && c !== '%total_conversion' && c !== '%new_conversion');
    newColumns.forEach(col => {
      const colInfo = schemaResult.recordset.find(r => r.COLUMN_NAME === col);
      console.log(`  - ${col} (${colInfo.DATA_TYPE})`);
    });
    
    console.log('\n🔄 CHANGED Columns:');
    console.log('  - roas → total_roas (renamed)');
    console.log('  - %conversion → %total_conversion (renamed)');
    console.log('  - NEW: new_roas (additional ROAS metric)');
    console.log('  - NEW: %new_conversion (additional conversion metric)');
    
    console.log('\n📈 New Metrics Available:');
    console.log('  1. new_leads & returning_leads (lead breakdown)');
    console.log('  2. total_roas & new_roas (ROAS breakdown)');
    console.log('  3. %total_conversion & %new_conversion (conversion breakdown)');
    console.log('  4. total_estimated_revenue & new_estimated_revenue');
    console.log('  5. avg_appointment_rev');
    console.log('  6. avg_estimated_ltv_6m');
    
    // Get sample data
    console.log('\n📋 Sample Data:');
    const sampleResult = await pool.request().query(`
      SELECT TOP 1 
        clinic,
        month,
        traffic_source,
        new_leads,
        returning_leads,
        total_roas,
        new_roas,
        total_estimated_revenue,
        new_estimated_revenue,
        avg_appointment_rev,
        avg_estimated_ltv_6m
      FROM executive_report_new_month 
      WHERE new_leads > 0
    `);
    
    if (sampleResult.recordset.length > 0) {
      const sample = sampleResult.recordset[0];
      console.log('  Clinic:', sample.clinic);
      console.log('  Month:', sample.month);
      console.log('  Traffic Source:', sample.traffic_source);
      console.log('  New Leads:', sample.new_leads);
      console.log('  Returning Leads:', sample.returning_leads);
      console.log('  Total ROAS:', sample.total_roas);
      console.log('  New ROAS:', sample.new_roas);
      console.log('  Total Est Revenue:', sample.total_estimated_revenue);
      console.log('  New Est Revenue:', sample.new_estimated_revenue);
    }
    
    // Get data stats
    console.log('\n📊 Data Statistics:');
    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT clinic) as unique_clinics,
        COUNT(DISTINCT month) as unique_months,
        MIN(month) as earliest_month,
        MAX(month) as latest_month
      FROM executive_report_new_month
    `);
    
    const stats = statsResult.recordset[0];
    console.log('  Total Records:', stats.total_records);
    console.log('  Unique Clinics:', stats.unique_clinics);
    console.log('  Unique Months:', stats.unique_months);
    console.log('  Date Range:', stats.earliest_month, 'to', stats.latest_month);
    
    await pool.close();
    
    console.log('\n✅ Schema analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();