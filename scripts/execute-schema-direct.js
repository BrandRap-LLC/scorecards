#!/usr/bin/env node

/**
 * Execute schema updates directly to Supabase using REST API
 */

require('dotenv').config({ path: '.env.local' });

async function executeSQL(sql) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc`,
    {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: 'exec',
        data: { sql }
      })
    }
  );
  
  return response;
}

async function executeSchemaUpdate() {
  console.log('🔄 Executing Schema Updates to Supabase');
  console.log('=========================================\n');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // First, check current schema
    console.log('📊 Checking current schema...');
    const { data: sample, error: sampleError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1)
      .single();
    
    if (!sample) {
      console.error('❌ Could not fetch table schema');
      return;
    }
    
    const currentColumns = Object.keys(sample);
    console.log('Current columns:', currentColumns.join(', '));
    
    // Check which new columns are missing
    const newColumns = [
      'total_roas', 'new_roas', 'total_conversion', 'new_conversion',
      'total_estimated_revenue', 'new_estimated_revenue',
      'avg_appointment_rev', 'avg_estimated_ltv_6m'
    ];
    
    const missingColumns = newColumns.filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('\n✅ All new columns already exist!');
      
      // Check if data needs to be copied from old columns
      const needsCopy = [];
      
      if ('roas' in sample && sample.roas !== null && sample.total_roas === null) {
        needsCopy.push({ from: 'roas', to: 'total_roas' });
      }
      
      if ('conversion_rate' in sample && sample.conversion_rate !== null && sample.total_conversion === null) {
        needsCopy.push({ from: 'conversion_rate', to: 'total_conversion' });
      }
      
      if (needsCopy.length > 0) {
        console.log('\n📋 Copying data from renamed columns...');
        
        for (const copy of needsCopy) {
          // Fetch all records that need updating
          const { data: records, error: fetchError } = await supabase
            .from('executive_monthly_reports')
            .select('id, ' + copy.from)
            .not(copy.from, 'is', null)
            .is(copy.to, null);
          
          if (records && records.length > 0) {
            console.log(`  Copying ${records.length} records from ${copy.from} to ${copy.to}...`);
            
            // Update in batches
            const batchSize = 50;
            for (let i = 0; i < records.length; i += batchSize) {
              const batch = records.slice(i, i + batchSize);
              
              for (const record of batch) {
                await supabase
                  .from('executive_monthly_reports')
                  .update({ [copy.to]: record[copy.from] })
                  .eq('id', record.id);
              }
              
              process.stdout.write(`\r    Progress: ${Math.min(i + batchSize, records.length)}/${records.length}`);
            }
            console.log(`\n  ✅ Copied ${copy.from} → ${copy.to}`);
          }
        }
      }
      
    } else {
      console.log(`\n⚠️  Missing columns: ${missingColumns.join(', ')}`);
      console.log('\n📝 The columns need to be added manually through Supabase dashboard:');
      console.log('1. Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new');
      console.log('2. Run this SQL:\n');
      
      console.log('-- Add missing columns');
      console.log('ALTER TABLE executive_monthly_reports');
      missingColumns.forEach((col, index) => {
        let type = 'DECIMAL(10,2)';
        if (col.includes('roas')) type = 'DECIMAL(10,4)';
        if (col.includes('conversion')) type = 'DECIMAL(5,2)';
        if (col.includes('revenue')) type = 'DECIMAL(12,2)';
        
        const comma = index < missingColumns.length - 1 ? ',' : ';';
        console.log(`ADD COLUMN IF NOT EXISTS ${col} ${type}${comma}`);
      });
      
      console.log('\n3. After adding columns, run this script again to copy data');
    }
    
    // Check data status
    console.log('\n📈 Current Data Status:');
    
    const { count: totalCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    const { data: stats } = await supabase
      .from('executive_monthly_reports')
      .select('roas, total_roas, conversion_rate, total_conversion')
      .limit(5);
    
    console.log(`  Total records: ${totalCount}`);
    
    if (stats && stats.length > 0) {
      const hasOldRoas = stats.filter(s => s.roas !== null).length;
      const hasNewRoas = stats.filter(s => s.total_roas !== null).length;
      const hasOldConv = stats.filter(s => s.conversion_rate !== null).length;
      const hasNewConv = stats.filter(s => s.total_conversion !== null).length;
      
      console.log(`  Sample data check (first 5 records):`);
      console.log(`    Old 'roas' populated: ${hasOldRoas}/5`);
      console.log(`    New 'total_roas' populated: ${hasNewRoas}/5`);
      console.log(`    Old 'conversion_rate' populated: ${hasOldConv}/5`);
      console.log(`    New 'total_conversion' populated: ${hasNewConv}/5`);
    }
    
    console.log('\n✨ Schema check complete!');
    
    if (missingColumns.length === 0) {
      console.log('\n📝 Next step: Run sync script to populate new columns from MSSQL:');
      console.log('  npm run sync:new-columns');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the update
executeSchemaUpdate().catch(console.error);