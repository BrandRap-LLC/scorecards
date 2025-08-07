#!/usr/bin/env node

/**
 * Execute ALTER TABLE statements to add missing columns
 */

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PostgreSQL direct connection for DDL operations
const pgConfig = {
  host: 'db.igzswopyyggvelncjmuh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'CPRREPORT1!',
  ssl: { rejectUnauthorized: false }
};

async function executeAlterStatements() {
  console.log('🔧 Adding Missing Columns to Supabase');
  console.log('====================================\n');
  
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to PostgreSQL directly
    console.log('📡 Connecting to Supabase PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Connected\n');
    
    // Define columns to add
    const columnsToAdd = [
      { name: 'total_roas', type: 'DECIMAL(10,2)' },
      { name: 'new_roas', type: 'DECIMAL(10,2)' },
      { name: 'new_leads', type: 'INTEGER' },
      { name: 'returning_leads', type: 'INTEGER' },
      { name: 'total_conversion', type: 'DECIMAL(5,2)' },
      { name: 'new_conversion', type: 'DECIMAL(5,2)' },
      { name: 'total_estimated_revenue', type: 'DECIMAL(10,2)' },
      { name: 'new_estimated_revenue', type: 'DECIMAL(10,2)' },
      { name: 'avg_appointment_rev', type: 'DECIMAL(10,2)' },
      { name: 'avg_estimated_ltv_6m', type: 'DECIMAL(10,2)' }
    ];
    
    console.log('📊 Adding columns...');
    
    for (const column of columnsToAdd) {
      try {
        const query = `ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
        await pgClient.query(query);
        console.log(`  ✅ Added column: ${column.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`  ⚠️  Column already exists: ${column.name}`);
        } else {
          console.error(`  ❌ Error adding ${column.name}:`, err.message);
        }
      }
    }
    
    // Verify columns
    console.log('\n📋 Verifying table structure...');
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
      ORDER BY ordinal_position
    `;
    
    const result = await pgClient.query(verifyQuery);
    console.log(`\n  Total columns: ${result.rows.length}`);
    console.log('\n  Column list:');
    result.rows.forEach((col, i) => {
      console.log(`    ${i + 1}. ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pgClient.end();
    console.log('\n🔌 Disconnected from PostgreSQL');
  }
}

executeAlterStatements();