const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearTables() {
  console.log('Starting to clear project tables...\n');

  const tables = [
    'executive_monthly_reports',
    'executive_weekly_reports',
    'paid_ads',
    'seo_channels',
    'seo_highlights_keyword_page_one'
  ];

  const results = [];

  for (const table of tables) {
    console.log(`Clearing table: ${table}`);
    
    try {
      // Try TRUNCATE first (faster and resets auto-increment)
      const { error: truncateError } = await supabase.rpc('truncate_table', { table_name: table });
      
      if (truncateError) {
        // If TRUNCATE fails, try DELETE
        console.log(`  TRUNCATE failed, trying DELETE...`);
        
        // First, try to get any row to see what columns exist
        const { data: sampleData, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (sampleError) {
          throw sampleError;
        }
        
        // Use a condition that will match all rows
        // If there's data, use the first column as a reference
        let deleteQuery = supabase.from(table).delete();
        
        if (sampleData && sampleData.length > 0) {
          const firstColumn = Object.keys(sampleData[0])[0];
          // Use a condition that matches everything
          deleteQuery = deleteQuery.not(firstColumn, 'is', null);
        } else {
          // If no data, try a simple delete with a always-true condition
          deleteQuery = deleteQuery.gte('created_at', '1900-01-01');
        }
        
        const { error: deleteError, count } = await deleteQuery;
        
        if (deleteError) {
          console.error(`  ❌ Failed to clear ${table}:`, deleteError.message);
          results.push({ table, status: 'failed', error: deleteError.message });
        } else {
          console.log(`  ✅ Successfully cleared ${table} (deleted ${count || 'all'} rows)`);
          results.push({ table, status: 'success', method: 'DELETE', rowsDeleted: count });
        }
      } else {
        console.log(`  ✅ Successfully truncated ${table}`);
        results.push({ table, status: 'success', method: 'TRUNCATE' });
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error clearing ${table}:`, error.message);
      results.push({ table, status: 'error', error: error.message });
    }
    
    console.log('');
  }

  // Summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Total tables processed: ${tables.length}`);
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error');
  
  console.log(`✅ Successfully cleared: ${successful.length}`);
  console.log(`❌ Failed to clear: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\nSuccessful operations:');
    successful.forEach(r => {
      console.log(`  - ${r.table} (${r.method}${r.rowsDeleted ? `, ${r.rowsDeleted} rows` : ''})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\nFailed operations:');
    failed.forEach(r => {
      console.log(`  - ${r.table}: ${r.error}`);
    });
  }
}

// Alternative approach using direct SQL if RPC doesn't work
async function clearTablesWithSQL() {
  console.log('Attempting to clear tables using direct SQL...\n');

  const tables = [
    'executive_monthly_reports',
    'executive_weekly_reports',
    'paid_ads',
    'seo_channels',
    'seo_highlights_keyword_page_one'
  ];

  for (const table of tables) {
    console.log(`Clearing table: ${table}`);
    
    try {
      // Use a DELETE statement that should work with Supabase
      const { data, error, count } = await supabase
        .from(table)
        .delete()
        .gte('id', 0); // This ensures we select all rows
      
      if (error) {
        console.error(`  ❌ Failed to clear ${table}:`, error.message);
      } else {
        console.log(`  ✅ Successfully cleared ${table}`);
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error clearing ${table}:`, error.message);
    }
    
    console.log('');
  }
}

// Check if truncate_table RPC exists, if not create it
async function ensureTruncateRPC() {
  try {
    // Try to create the RPC function (will fail silently if it exists)
    const { error } = await supabase.rpc('create_truncate_function', {
      sql: `
        CREATE OR REPLACE FUNCTION truncate_table(table_name text)
        RETURNS void AS $$
        BEGIN
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name) || ' RESTART IDENTITY CASCADE';
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (!error) {
      console.log('Created truncate_table RPC function');
    }
  } catch (e) {
    // Function might already exist, which is fine
  }
}

// Main execution
async function main() {
  // First try the regular approach
  await clearTables();
  
  // If you want to try the SQL approach instead, uncomment:
  // await clearTablesWithSQL();
}

main().catch(console.error);