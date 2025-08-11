#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Direct connection string as provided
const connectionString = 'postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres';

async function fixMissingColumns() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Add missing columns to executive_monthly_reports
    console.log('\n📝 Adding missing columns to executive_monthly_reports...');
    await client.query(`
      ALTER TABLE executive_monthly_reports 
      ADD COLUMN IF NOT EXISTS ltv DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS roas DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS total_conversations INTEGER,
      ADD COLUMN IF NOT EXISTS new_conversations INTEGER,
      ADD COLUMN IF NOT EXISTS returning_conversations INTEGER;
    `);
    console.log('✅ Successfully added columns to executive_monthly_reports');
    
    // Add missing columns to executive_weekly_reports
    console.log('\n📝 Adding missing columns to executive_weekly_reports...');
    await client.query(`
      ALTER TABLE executive_weekly_reports
      ADD COLUMN IF NOT EXISTS week_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS impressions_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS visits_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS spend_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS leads_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS conversion_rate_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS cac_total_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS roas DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS roas_wow DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS is_mtd BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Successfully added columns to executive_weekly_reports');
    
    // Verify all columns exist
    console.log('\n🔍 Verifying column counts...');
    const result = await client.query(`
      SELECT table_name, COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_name IN ('executive_monthly_reports', 'executive_weekly_reports')
        AND table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Column counts:');
    result.rows.forEach(row => {
      console.log(`   ${row.table_name}: ${row.column_count} columns`);
    });
    
    // List all columns for verification
    console.log('\n📋 Listing all columns for executive_monthly_reports:');
    const monthlyColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    monthlyColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n📋 Listing all columns for executive_weekly_reports:');
    const weeklyColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'executive_weekly_reports' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    weeklyColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✅ All operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) {
      console.error('   Detail:', error.detail);
    }
  } finally {
    await client.end();
  }
}

fixMissingColumns();