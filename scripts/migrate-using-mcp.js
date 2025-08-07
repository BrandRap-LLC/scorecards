#!/usr/bin/env node

/**
 * Migration using MCP servers: Copy data from MSSQL to Supabase
 */

const { spawn } = require('child_process');

async function executeMcpCommand(server, tool, params) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('npx', [
      'mcp-client',
      server,
      tool,
      JSON.stringify(params)
    ]);

    let output = '';
    let error = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP command failed: ${error}`));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve(output);
        }
      }
    });
  });
}

async function migrate() {
  console.log('🔄 Executive Monthly Report Migration (using MCP)');
  console.log('================================================\n');

  try {
    // Step 1: Query all data from MSSQL
    console.log('📥 Fetching data from MSSQL executive_report_new_month...');
    
    const mssqlQuery = 'SELECT * FROM executive_report_new_month';
    const mssqlData = await executeMcpCommand('mssql-server', 'query', { query: mssqlQuery });
    
    if (!mssqlData || !mssqlData.length) {
      console.log('⚠️  No data found in MSSQL');
      return;
    }
    
    console.log(`📊 Found ${mssqlData.length} records\n`);

    // Step 2: Transform data for Supabase (matching the existing schema)
    const transformedData = mssqlData.map(row => ({
      clinic: row.clinic,
      month: row.month,
      traffic_source: row.traffic_source,
      impressions: row.impressions,
      visits: row.visits,
      spend: row.spend,
      ltv: row.ltv,
      estimated_ltv_6m: row.estimated_ltv_6m,
      avg_ltv: row.avg_ltv,
      roas: row.roas,
      leads: row.leads,
      conversion_rate: row['%conversion'] || row.conversion || 0,
      cac_total: row.cac_total,
      cac_new: row.cac_new,
      total_appointments: row.total_appointments,
      new_appointments: row.new_appointments,
      returning_appointments: row.returning_appointments,
      online_booking: row.online_booking,
      total_conversations: row.total_conversations,
      new_conversations: row.new_conversations,
      returning_conversations: row.returning_conversations,
      created_at: new Date().toISOString(),
      import_source: 'mssql_executive_report_new_month'
    }));

    // Step 3: Insert data into Supabase in batches
    console.log('📤 Uploading to Supabase...');
    const batchSize = 50;
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      try {
        const insertQuery = `
          INSERT INTO executive_monthly_reports 
          (clinic, month, traffic_source, impressions, visits, spend, ltv, 
           estimated_ltv_6m, avg_ltv, roas, leads, conversion_rate, cac_total, 
           cac_new, total_appointments, new_appointments, returning_appointments, 
           online_booking, total_conversations, new_conversations, 
           returning_conversations, created_at, import_source)
          VALUES 
          ${batch.map(row => `(
            '${row.clinic}', '${row.month}', '${row.traffic_source}', 
            ${row.impressions}, ${row.visits}, ${row.spend}, ${row.ltv}, 
            ${row.estimated_ltv_6m}, ${row.avg_ltv}, ${row.roas}, 
            ${row.leads}, ${row.conversion_rate}, ${row.cac_total}, 
            ${row.cac_new}, ${row.total_appointments}, ${row.new_appointments}, 
            ${row.returning_appointments}, ${row.online_booking}, 
            ${row.total_conversations}, ${row.new_conversations}, 
            ${row.returning_conversations}, '${row.created_at}', '${row.import_source}'
          )`).join(', ')}
        `;
        
        await executeMcpCommand('supabase-mcp-server', 'query', { query: insertQuery });
        inserted += batch.length;
        process.stdout.write(`\r  Progress: ${inserted}/${transformedData.length} records`);
      } catch (error) {
        console.error(`\n❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        failed += batch.length;
      }
    }

    console.log('\n\n✨ Migration Summary:');
    console.log('====================');
    console.log(`  ✅ Successfully migrated: ${inserted} records`);
    if (failed > 0) {
      console.log(`  ❌ Failed: ${failed} records`);
    }

    // Verify the migration
    const countQuery = 'SELECT COUNT(*) as count FROM executive_monthly_reports';
    const countResult = await executeMcpCommand('supabase-mcp-server', 'query', { query: countQuery });
    
    if (countResult && countResult[0]) {
      console.log(`\n📈 Total records in Supabase executive_monthly_reports table: ${countResult[0].count}`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  }
}

// Run migration
migrate().catch(console.error);