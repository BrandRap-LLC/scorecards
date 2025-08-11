#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Table schemas based on MSSQL structure
const TABLE_SCHEMAS = [
  {
    name: 'executive_weekly_reports',
    sql: `
      CREATE TABLE IF NOT EXISTS executive_weekly_reports (
        clinic text,
        week numeric,
        traffic_source text,
        impressions numeric,
        visits numeric,
        spend numeric,
        ltv numeric,
        ltv_wo_insurance numeric,
        avg_ltv numeric,
        estimated_ltv_6m numeric,
        roas numeric,
        leads numeric,
        leads_new numeric,
        leads_returning numeric,
        conversion_rate numeric,
        cac_total numeric,
        cac_new numeric,
        appointments numeric,
        appointments_new numeric,
        appointments_returning numeric,
        online_booking numeric,
        conversations numeric,
        conversations_new numeric,
        conversations_returning numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `
  },
  {
    name: 'executive_summary',
    sql: `
      CREATE TABLE IF NOT EXISTS executive_summary (
        clinic text,
        month text,
        traffic_source text,
        appointments numeric,
        appointments_new numeric,
        appointments_returning numeric,
        estimated_ltv_6m numeric,
        estimated_revenue numeric,
        conversations numeric,
        conversations_new numeric,
        conversations_returning numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `
  },
  {
    name: 'ceo_weekly_reports',
    sql: `
      CREATE TABLE IF NOT EXISTS ceo_weekly_reports (
        week numeric,
        company text,
        clinic text,
        impressions numeric,
        visits numeric,
        leads numeric,
        appointments numeric,
        spend numeric,
        ltv numeric,
        roas numeric,
        conversion_rate numeric,
        cost_per_lead numeric,
        cost_per_appointment numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `
  },
  {
    name: 'ceo_monthly_reports',
    sql: `
      CREATE TABLE IF NOT EXISTS ceo_monthly_reports (
        month text,
        company text,
        clinic text,
        impressions numeric,
        visits numeric,
        leads numeric,
        appointments numeric,
        spend numeric,
        ltv numeric,
        roas numeric,
        conversion_rate numeric,
        cost_per_lead numeric,
        cost_per_appointment numeric,
        created_at timestamp with time zone DEFAULT now()
      );
    `
  }
];

async function createTables() {
  console.log('🔨 Creating Supabase tables for migration...\n');
  
  for (const table of TABLE_SCHEMAS) {
    console.log(`📋 Creating table: ${table.name}`);
    
    try {
      // Use Supabase's SQL editor API to create tables
      // Since we can't use RPC, we'll check if table exists first
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(`   ⚠️  Table ${table.name} does not exist.`);
        console.log(`   📝 Please create it manually in Supabase SQL Editor with this SQL:`);
        console.log(`\n${table.sql}\n`);
      } else if (error) {
        console.log(`   ❌ Error checking table: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${table.name} already exists`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n📝 SQL Script to create all tables:');
  console.log('=====================================\n');
  console.log('-- Run this in Supabase SQL Editor:');
  TABLE_SCHEMAS.forEach(table => {
    console.log(table.sql);
  });
  
  console.log('\n✅ Table creation script ready!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to your Supabase Dashboard > SQL Editor');
  console.log('3. Paste and run the SQL');
  console.log('4. Then run: node scripts/migrate-all-tables-simple.js');
}

createTables().catch(console.error);