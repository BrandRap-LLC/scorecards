#!/usr/bin/env node

/**
 * Execute schema updates directly to Supabase
 * Adds new columns from revised MSSQL schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSchemaUpdate() {
  console.log('🔄 Executing Schema Updates to Supabase');
  console.log('=========================================\n');
  
  try {
    // Step 1: Add new columns
    console.log('📝 Adding new columns to executive_monthly_reports table...');
    
    const alterTableSQL = `
      ALTER TABLE executive_monthly_reports
      ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,4),
      ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);
    `;
    
    const { data: alterResult, error: alterError } = await supabase.rpc('exec_sql', {
      query: alterTableSQL
    }).single();
    
    if (alterError && !alterError.message.includes('already exists')) {
      // Try alternative approach - execute via raw SQL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: alterTableSQL })
        }
      );
      
      if (!response.ok) {
        // Try individual column additions
        console.log('⚠️  Batch ALTER failed, trying individual columns...');
        
        const columns = [
          { name: 'total_roas', type: 'DECIMAL(10,4)' },
          { name: 'new_roas', type: 'DECIMAL(10,4)' },
          { name: 'total_conversion', type: 'DECIMAL(5,2)' },
          { name: 'new_conversion', type: 'DECIMAL(5,2)' },
          { name: 'total_estimated_revenue', type: 'DECIMAL(12,2)' },
          { name: 'new_estimated_revenue', type: 'DECIMAL(12,2)' },
          { name: 'avg_appointment_rev', type: 'DECIMAL(10,2)' },
          { name: 'avg_estimated_ltv_6m', type: 'DECIMAL(10,2)' }
        ];
        
        for (const column of columns) {
          const singleColumnSQL = `
            ALTER TABLE executive_monthly_reports
            ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};
          `;
          
          // Use direct API approach
          const columnResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
            {
              method: 'POST',
              headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query: singleColumnSQL })
            }
          );
          
          if (columnResponse.ok) {
            console.log(`  ✅ Added column: ${column.name}`);
          } else {
            console.log(`  ⚠️  Column might already exist: ${column.name}`);
          }
        }
      }
    } else {
      console.log('✅ Columns added successfully');
    }
    
    // Step 2: Copy data from old columns to new ones for backward compatibility
    console.log('\n📋 Copying data from renamed columns...');
    
    // Update total_roas from roas
    const { error: roasError } = await supabase
      .from('executive_monthly_reports')
      .update({ total_roas: supabase.raw('roas') })
      .is('total_roas', null)
      .not('roas', 'is', null);
    
    if (!roasError) {
      console.log('  ✅ Copied roas → total_roas');
    } else if (!roasError.message.includes('column')) {
      console.log('  ⚠️  Could not copy roas data:', roasError.message);
    }
    
    // Update total_conversion from conversion_rate
    const { error: convError } = await supabase
      .from('executive_monthly_reports')
      .update({ total_conversion: supabase.raw('conversion_rate') })
      .is('total_conversion', null)
      .not('conversion_rate', 'is', null);
    
    if (!convError) {
      console.log('  ✅ Copied conversion_rate → total_conversion');
    } else if (!convError.message.includes('column')) {
      console.log('  ⚠️  Could not copy conversion_rate data:', convError.message);
    }
    
    // Step 3: Verify the schema update
    console.log('\n🔍 Verifying schema update...');
    
    // Get a sample record to check columns
    const { data: sample, error: sampleError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1)
      .single();
    
    if (sample && !sampleError) {
      const newColumns = [
        'total_roas', 'new_roas', 'total_conversion', 'new_conversion',
        'total_estimated_revenue', 'new_estimated_revenue',
        'avg_appointment_rev', 'avg_estimated_ltv_6m'
      ];
      
      const existingNewColumns = newColumns.filter(col => col in sample);
      const missingNewColumns = newColumns.filter(col => !(col in sample));
      
      console.log(`\n📊 Schema Status:`);
      console.log(`  ✅ New columns present: ${existingNewColumns.length}/${newColumns.length}`);
      
      if (existingNewColumns.length > 0) {
        console.log(`  Columns added: ${existingNewColumns.join(', ')}`);
      }
      
      if (missingNewColumns.length > 0) {
        console.log(`  ⚠️  Missing columns: ${missingNewColumns.join(', ')}`);
        console.log('\n  Note: You may need to run the SQL directly in Supabase dashboard:');
        console.log('  https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new');
      }
    }
    
    // Step 4: Check current data status
    console.log('\n📈 Current Data Status:');
    
    const { count: totalCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    const { count: roasCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true })
      .not('roas', 'is', null);
    
    const { count: totalRoasCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true })
      .not('total_roas', 'is', null);
    
    console.log(`  Total records: ${totalCount}`);
    console.log(`  Records with old 'roas' data: ${roasCount}`);
    console.log(`  Records with new 'total_roas' data: ${totalRoasCount}`);
    
    if (totalRoasCount === 0 && roasCount > 0) {
      console.log('\n⚠️  New columns exist but data not copied. This might be normal if columns just added.');
      console.log('  Run the sync script next: npm run sync:new-columns');
    } else if (totalRoasCount > 0) {
      console.log('\n✅ Schema update successful! Some data already migrated.');
      console.log('  Next step: Run sync script to populate remaining new columns from MSSQL');
    }
    
  } catch (error) {
    console.error('❌ Error executing schema update:', error.message);
    
    console.log('\n📝 Alternative: Execute SQL directly in Supabase dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new');
    console.log('2. Copy and run the SQL from: sql/update_schema_complete.sql');
    console.log('3. Then run: npm run sync:new-columns');
  }
}

// Run the update
executeSchemaUpdate().catch(console.error);