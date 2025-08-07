#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Parse Supabase connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = match ? match[1] : null;

const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function addColumn() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Add the missing column
    await client.query(`
      ALTER TABLE executive_monthly_reports 
      ADD COLUMN IF NOT EXISTS returning_conversion DOUBLE PRECISION;
    `);
    
    console.log('✅ Successfully added returning_conversion column');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addColumn();