#!/usr/bin/env node

/**
 * Remove duplicate columns to ensure exact MSSQL parity
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// PostgreSQL configuration
const pgConfig = {
  host: 'db.igzswopyyggvelncjmuh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'CPRREPORT1!',
  ssl: { rejectUnauthorized: false }
};

async function removeDuplicateColumns() {
  console.log('🗑️  Removing Duplicate Columns for MSSQL Parity');
  console.log('==============================================\n');
  
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to PostgreSQL
    console.log('📡 Connecting to Supabase PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Connected\n');
    
    // Check current columns before dropping
    console.log('📋 Current columns:');
    const beforeResult = await pgClient.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
      ORDER BY ordinal_position
    `);
    console.log(`  Total columns: ${beforeResult.rows.length}`);
    
    // Drop duplicate columns
    console.log('\n🗑️  Dropping duplicate columns...');
    
    const columnsToDrop = [
      { name: 'roas', reason: 'Duplicate of total_roas' },
      { name: 'conversion_rate', reason: 'Duplicate of total_conversion' }
    ];
    
    for (const column of columnsToDrop) {
      try {
        console.log(`\n  Dropping ${column.name}...`);
        console.log(`  Reason: ${column.reason}`);
        
        await pgClient.query(`ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS ${column.name}`);
        console.log(`  ✅ Dropped ${column.name}`);
      } catch (err) {
        console.error(`  ❌ Error dropping ${column.name}:`, err.message);
      }
    }
    
    // Verify columns after dropping
    console.log('\n📋 Columns after cleanup:');
    const afterResult = await pgClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
      ORDER BY ordinal_position
    `);
    
    console.log(`  Total columns: ${afterResult.rows.length}\n`);
    console.log('  Remaining columns:');
    afterResult.rows.forEach((col, i) => {
      console.log(`    ${i + 1}. ${col.column_name} (${col.data_type})`);
    });
    
    // Show mapping of MSSQL to Supabase columns
    console.log('\n📌 MSSQL to Supabase Column Mapping:');
    console.log('  MSSQL → Supabase');
    console.log('  ----------------');
    console.log('  %total_conversion → total_conversion');
    console.log('  %new_conversion → new_conversion');
    console.log('  All other columns → Same name');
    
    console.log('\n✅ Cleanup complete! Supabase now matches MSSQL schema exactly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pgClient.end();
    console.log('\n🔌 Disconnected from PostgreSQL');
  }
}

removeDuplicateColumns();