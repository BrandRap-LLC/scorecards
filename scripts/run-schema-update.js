#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSchemaUpdate() {
  console.log('🔄 Updating Supabase tables to match MSSQL schema...\n');
  
  try {
    const sqlPath = path.join(__dirname, 'update-supabase-tables-to-match-mssql.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    console.log('📋 SQL Script will:');
    console.log('1. DROP and recreate paid_ads table with MSSQL schema');
    console.log('2. DROP and recreate seo_channels table with MSSQL schema');
    console.log('3. Add proper indexes and RLS policies\n');
    
    console.log('⚠️  WARNING: This will delete all existing data in these tables!\n');
    
    // Since Supabase JS client doesn't support direct DDL execution,
    // we need to provide instructions for manual execution
    console.log('📋 Please follow these steps to update the schema:\n');
    console.log(`1. Open Supabase SQL Editor: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/_/sql\n`);
    console.log('2. Copy and paste the entire contents of this file:');
    console.log('   scripts/update-supabase-tables-to-match-mssql.sql\n');
    console.log('3. Click "Run" to execute the SQL\n');
    console.log('4. After successful execution, come back and run:');
    console.log('   node scripts/sync-mssql-to-supabase.js\n');
    
    // Save a simplified version for easy copying
    const simplifiedSQL = `
-- Quick execution: Run this in Supabase SQL Editor

-- 1. Update paid_ads table
DROP TABLE IF EXISTS paid_ads CASCADE;

CREATE TABLE paid_ads (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR NOT NULL,
  month DATE NOT NULL,
  traffic_source VARCHAR NOT NULL,
  campaign VARCHAR NOT NULL,
  impressions NUMERIC,
  visits NUMERIC,
  spend NUMERIC,
  estimated_ltv_6m NUMERIC,
  total_roas NUMERIC,
  new_roas NUMERIC,
  leads NUMERIC,
  new_leads NUMERIC,
  returning_leads NUMERIC,
  total_conversion NUMERIC,
  new_conversion NUMERIC,
  returning_conversion NUMERIC,
  cac_total NUMERIC,
  cac_new NUMERIC,
  total_estimated_revenue NUMERIC,
  new_estimated_revenue NUMERIC,
  total_appointments NUMERIC,
  new_appointments NUMERIC,
  returning_appointments NUMERIC,
  total_conversations NUMERIC,
  new_conversations NUMERIC,
  returning_conversations NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update seo_channels table
DROP TABLE IF EXISTS seo_channels CASCADE;

CREATE TABLE seo_channels (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR NOT NULL,
  month DATE NOT NULL,
  traffic_source VARCHAR NOT NULL,
  impressions NUMERIC,
  visits NUMERIC,
  estimated_ltv_6m NUMERIC,
  leads NUMERIC,
  new_leads NUMERIC,
  returning_leads NUMERIC,
  total_conversion NUMERIC,
  new_conversion NUMERIC,
  returning_conversion NUMERIC,
  total_estimated_revenue NUMERIC,
  new_estimated_revenue NUMERIC,
  total_appointments NUMERIC,
  new_appointments NUMERIC,
  returning_appointments NUMERIC,
  total_conversations NUMERIC,
  new_conversations NUMERIC,
  returning_conversations NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE paid_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_channels ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public read access
CREATE POLICY "Allow public read" ON paid_ads FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON seo_channels FOR SELECT USING (true);
    `;
    
    // Also output the simplified version
    console.log('--- SIMPLIFIED SQL (copy below) ---\n');
    console.log(simplifiedSQL);
    console.log('\n--- END SQL ---\n');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSchemaUpdate();