#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Parse Supabase connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = match ? match[1] : null;

const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function addConversionColumns() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Add the missing columns
    await client.query(`
      ALTER TABLE executive_monthly_reports 
      ADD COLUMN IF NOT EXISTS "%new_conversion" NUMERIC,
      ADD COLUMN IF NOT EXISTS "%returning_conversion" NUMERIC;
    `);
    
    console.log('✅ Successfully added conversion columns');
    
    // Add comments
    await client.query(`
      COMMENT ON COLUMN executive_monthly_reports."%new_conversion" IS 'New customer conversion rate as percentage';
      COMMENT ON COLUMN executive_monthly_reports."%returning_conversion" IS 'Returning customer conversion rate as percentage';
    `);
    
    console.log('✅ Successfully added column comments');
    
    // Verify the columns were added
    const result = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'executive_monthly_reports'
      AND column_name IN ('%new_conversion', '%returning_conversion')
      ORDER BY column_name;
    `);
    
    console.log('\n✅ Verification - Columns found:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.numeric_precision ? `(${col.numeric_precision},${col.numeric_scale})` : ''}`);
    });
    
    // Check all columns in the table
    const allColumnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'executive_monthly_reports'
      ORDER BY ordinal_position;
    `);
    
    console.log(`\nTotal columns in table: ${allColumnsResult.rows.length}`);
    const conversionColumns = allColumnsResult.rows.filter(col => 
      col.column_name.includes('conversion')
    );
    console.log(`Conversion-related columns: ${conversionColumns.length}`);
    conversionColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addConversionColumns();