#!/usr/bin/env node

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

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
  }
};

async function checkLeadsDataSource() {
  console.log('🔍 Checking for leads data in executive_report_new_month\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Check if we can match paid ads campaigns with executive monthly data
    const result = await mssqlPool.request()
      .query(`
        SELECT TOP 10
          e.clinic,
          e.month,
          e.traffic_source,
          e.leads,
          e.new_leads,
          e.returning_leads,
          p.campaign,
          p.spend,
          p.total_appointments
        FROM executive_report_new_month e
        LEFT JOIN paid_ads p 
          ON e.clinic = p.clinic 
          AND e.month = p.month 
          AND e.traffic_source = p.traffic_source
        WHERE e.traffic_source IN ('google ads', 'social ads')
          AND e.month = '2025-08-01'
          AND p.campaign IS NOT NULL
        ORDER BY p.spend DESC
      `);
    
    console.log('📊 Sample matched data:');
    console.log('Records found:', result.recordset.length);
    
    if (result.recordset.length > 0) {
      console.log('\nSample records:');
      result.recordset.slice(0, 3).forEach((record, i) => {
        console.log(`\n${i + 1}. ${record.clinic} - ${record.campaign}`);
        console.log(`   Traffic Source: ${record.traffic_source}`);
        console.log(`   Leads: ${record.leads} (New: ${record.new_leads}, Returning: ${record.returning_leads})`);
        console.log(`   Appointments: ${record.total_appointments}`);
        console.log(`   Spend: $${record.spend}`);
      });
    }
    
    // Check if executive data is aggregated at traffic source level
    console.log('\n\n📋 Checking aggregation level:');
    const aggResult = await mssqlPool.request()
      .query(`
        SELECT 
          clinic,
          traffic_source,
          COUNT(*) as campaign_count,
          SUM(spend) as total_spend
        FROM paid_ads
        WHERE month = '2025-08-01'
          AND traffic_source IN ('google ads', 'social ads')
        GROUP BY clinic, traffic_source
        ORDER BY clinic, traffic_source
      `);
    
    console.log('\nCampaigns per traffic source:');
    aggResult.recordset.slice(0, 5).forEach(record => {
      console.log(`  ${record.clinic} - ${record.traffic_source}: ${record.campaign_count} campaigns`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

checkLeadsDataSource();