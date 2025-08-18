const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL config
const mssqlConfig = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true
  }
};

async function syncAllData() {
  let mssqlPool;
  
  try {
    console.log('🚀 Starting comprehensive data sync...\n');
    console.log(`Current date: ${new Date().toISOString()}`);
    console.log('=' . repeat(60) + '\n');
    
    // Connect to MSSQL
    console.log('Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // 1. Sync paid_ads from marketing_score_card_daily
    await syncPaidAds(mssqlPool);
    
    // 2. Sync SEO channels
    await syncSeoChannels(mssqlPool);
    
    // 3. Sync SEO keywords (if applicable)
    await syncSeoKeywords(mssqlPool);
    
    console.log('\n' + '=' . repeat(60));
    console.log('✅ All sync operations completed successfully!');
    console.log('=' . repeat(60));
    
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    throw error;
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\nClosed MSSQL connection');
    }
  }
}

async function syncPaidAds(mssqlPool) {
  console.log('📊 Syncing paid_ads table from marketing_score_card_daily...');
  console.log('-' . repeat(50));
  
  try {
    // Get latest month in Supabase
    const { data: latestData } = await supabase
      .from('paid_ads')
      .select('month')
      .order('month', { ascending: false })
      .limit(1);
    
    const latestMonth = latestData?.[0]?.month || '2000-01-01';
    console.log(`  Current latest month in Supabase: ${latestMonth}`);
    
    // Aggregate MSSQL data by month, clinic, traffic_source, campaign
    const result = await mssqlPool.request()
      .input('latestMonth', sql.Date, latestMonth)
      .query(`
        SELECT 
          clinic,
          month,
          traffic_source,
          campaign,
          SUM(impressions) as impressions,
          SUM(visits) as visits,
          SUM(spend) as spend,
          AVG(avg_appointment_rev) as estimated_ltv_6m,
          CASE 
            WHEN SUM(spend) > 0 THEN SUM(appointment_est_revenue) / SUM(spend)
            ELSE 0 
          END as total_roas,
          CASE 
            WHEN SUM(spend) > 0 THEN SUM(new_appointment_est_6m_revenue) / SUM(spend)
            ELSE 0 
          END as new_roas,
          SUM(visits) as leads,  -- Using visits as proxy for leads
          SUM(CASE WHEN new_conversations > 0 THEN visits ELSE 0 END) as new_leads,
          SUM(CASE WHEN returning_conversations > 0 THEN visits ELSE 0 END) as returning_leads,
          AVG(conversation_rate) as total_conversion,
          AVG(CASE WHEN new_conversations > 0 THEN conversation_rate ELSE 0 END) as new_conversion,
          AVG(CASE WHEN returning_conversations > 0 THEN conversation_rate ELSE 0 END) as returning_conversion,
          CASE 
            WHEN SUM(total_appointments) > 0 THEN SUM(spend) / SUM(total_appointments)
            ELSE 0 
          END as cac_total,
          CASE 
            WHEN SUM(new_appointments) > 0 THEN SUM(spend) / SUM(new_appointments)
            ELSE 0 
          END as cac_new,
          SUM(appointment_est_revenue) as total_estimated_revenue,
          SUM(new_appointment_est_6m_revenue) as new_estimated_revenue,
          SUM(total_appointments) as total_appointments,
          SUM(new_appointments) as new_appointments,
          SUM(returning_appointments) as returning_appointments,
          SUM(total_conversations) as total_conversations,
          SUM(new_conversations) as new_conversations,
          SUM(returning_conversations) as returning_conversations
        FROM marketing_score_card_daily
        WHERE month > @latestMonth
          AND traffic_source IN ('google ads', 'meta ads', 'bing ads')
          AND campaign IS NOT NULL
        GROUP BY clinic, month, traffic_source, campaign
        ORDER BY month, clinic, traffic_source, campaign
      `);
    
    if (result.recordset.length === 0) {
      console.log('  ✓ No new paid ads records to sync');
      return;
    }
    
    console.log(`  Found ${result.recordset.length} new aggregated records to sync`);
    
    // Delete existing records for the months we're updating to avoid duplicates
    const monthsToUpdate = [...new Set(result.recordset.map(r => r.month))];
    console.log(`  Months to update: ${monthsToUpdate.map(m => new Date(m).toISOString().split('T')[0]).join(', ')}`);
    
    for (const month of monthsToUpdate) {
      const { error: deleteError } = await supabase
        .from('paid_ads')
        .delete()
        .eq('month', new Date(month).toISOString().split('T')[0]);
      
      if (deleteError) {
        console.error(`  ❌ Error deleting existing records for ${month}:`, deleteError.message);
      }
    }
    
    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('paid_ads')
        .insert(batch.map(row => ({
          clinic: row.clinic,
          month: new Date(row.month).toISOString().split('T')[0],
          traffic_source: row.traffic_source,
          campaign: row.campaign,
          impressions: Math.round(row.impressions || 0),
          visits: Math.round(row.visits || 0),
          spend: parseFloat((row.spend || 0).toFixed(2)),
          estimated_ltv_6m: parseFloat((row.estimated_ltv_6m || 0).toFixed(2)),
          total_roas: parseFloat((row.total_roas || 0).toFixed(4)),
          new_roas: parseFloat((row.new_roas || 0).toFixed(4)),
          leads: Math.round(row.leads || 0),
          new_leads: Math.round(row.new_leads || 0),
          returning_leads: Math.round(row.returning_leads || 0),
          total_conversion: parseFloat((row.total_conversion || 0).toFixed(4)),
          new_conversion: parseFloat((row.new_conversion || 0).toFixed(4)),
          returning_conversion: parseFloat((row.returning_conversion || 0).toFixed(4)),
          cac_total: parseFloat((row.cac_total || 0).toFixed(2)),
          cac_new: parseFloat((row.cac_new || 0).toFixed(2)),
          total_estimated_revenue: parseFloat((row.total_estimated_revenue || 0).toFixed(2)),
          new_estimated_revenue: parseFloat((row.new_estimated_revenue || 0).toFixed(2)),
          total_appointments: Math.round(row.total_appointments || 0),
          new_appointments: Math.round(row.new_appointments || 0),
          returning_appointments: Math.round(row.returning_appointments || 0),
          total_conversations: Math.round(row.total_conversations || 0),
          new_conversations: Math.round(row.new_conversations || 0),
          returning_conversations: Math.round(row.returning_conversations || 0)
        })));
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        throw error;
      }
      
      console.log(`  ✓ Inserted batch ${i / batchSize + 1} of ${Math.ceil(result.recordset.length / batchSize)}`);
    }
    
    console.log(`  ✅ Successfully synced ${result.recordset.length} records to paid_ads\n`);
    
  } catch (error) {
    console.error('  ❌ Error syncing paid_ads:', error.message);
    throw error;
  }
}

async function syncSeoChannels(mssqlPool) {
  console.log('📊 Syncing seo_channels table...');
  console.log('-' . repeat(50));
  
  try {
    // Get latest month in Supabase
    const { data: latestData } = await supabase
      .from('seo_channels')
      .select('month')
      .order('month', { ascending: false })
      .limit(1);
    
    const latestMonth = latestData?.[0]?.month || '2000-01-01';
    console.log(`  Current latest month in Supabase: ${latestMonth}`);
    
    // Check if seo_channels exists in MSSQL
    const tableCheck = await mssqlPool.request()
      .query(`
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'seo_channels'
      `);
    
    if (tableCheck.recordset[0].count === 0) {
      console.log('  ℹ️  seo_channels table not found in MSSQL, trying to aggregate from marketing_score_card_daily...');
      
      // Aggregate SEO data from marketing_score_card_daily
      const result = await mssqlPool.request()
        .input('latestMonth', sql.Date, latestMonth)
        .query(`
          SELECT 
            clinic,
            month,
            traffic_source,
            SUM(impressions) as impressions,
            SUM(visits) as visits,
            AVG(avg_appointment_rev) as estimated_ltv_6m,
            SUM(visits) as leads,
            SUM(CASE WHEN new_conversations > 0 THEN visits ELSE 0 END) as new_leads,
            SUM(CASE WHEN returning_conversations > 0 THEN visits ELSE 0 END) as returning_leads,
            AVG(conversation_rate) as total_conversion,
            AVG(CASE WHEN new_conversations > 0 THEN conversation_rate ELSE 0 END) as new_conversion,
            AVG(CASE WHEN returning_conversations > 0 THEN conversation_rate ELSE 0 END) as returning_conversion,
            SUM(appointment_est_revenue) as total_estimated_revenue,
            SUM(new_appointment_est_6m_revenue) as new_estimated_revenue,
            SUM(total_appointments) as total_appointments,
            SUM(new_appointments) as new_appointments,
            SUM(returning_appointments) as returning_appointments,
            SUM(total_conversations) as total_conversations,
            SUM(new_conversations) as new_conversations,
            SUM(returning_conversations) as returning_conversations
          FROM marketing_score_card_daily
          WHERE month > @latestMonth
            AND traffic_source IN ('local seo', 'seo', 'organic', 'google business profile', 'google my business')
          GROUP BY clinic, month, traffic_source
          ORDER BY month, clinic, traffic_source
        `);
      
      if (result.recordset.length === 0) {
        console.log('  ✓ No new SEO channel records to sync');
        return;
      }
      
      console.log(`  Found ${result.recordset.length} new SEO records to sync`);
      
      // Delete existing records for the months we're updating
      const monthsToUpdate = [...new Set(result.recordset.map(r => r.month))];
      for (const month of monthsToUpdate) {
        const { error: deleteError } = await supabase
          .from('seo_channels')
          .delete()
          .eq('month', new Date(month).toISOString().split('T')[0]);
        
        if (deleteError) {
          console.error(`  ❌ Error deleting existing records for ${month}:`, deleteError.message);
        }
      }
      
      // Insert in batches
      const batchSize = 100;
      for (let i = 0; i < result.recordset.length; i += batchSize) {
        const batch = result.recordset.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('seo_channels')
          .insert(batch.map(row => ({
            clinic: row.clinic,
            month: new Date(row.month).toISOString().split('T')[0],
            traffic_source: row.traffic_source,
            impressions: Math.round(row.impressions || 0),
            visits: Math.round(row.visits || 0),
            estimated_ltv_6m: parseFloat((row.estimated_ltv_6m || 0).toFixed(2)),
            leads: Math.round(row.leads || 0),
            new_leads: Math.round(row.new_leads || 0),
            returning_leads: Math.round(row.returning_leads || 0),
            total_conversion: parseFloat((row.total_conversion || 0).toFixed(4)),
            new_conversion: parseFloat((row.new_conversion || 0).toFixed(4)),
            returning_conversion: parseFloat((row.returning_conversion || 0).toFixed(4)),
            total_estimated_revenue: parseFloat((row.total_estimated_revenue || 0).toFixed(2)),
            new_estimated_revenue: parseFloat((row.new_estimated_revenue || 0).toFixed(2)),
            total_appointments: Math.round(row.total_appointments || 0),
            new_appointments: Math.round(row.new_appointments || 0),
            returning_appointments: Math.round(row.returning_appointments || 0),
            total_conversations: Math.round(row.total_conversations || 0),
            new_conversations: Math.round(row.new_conversations || 0),
            returning_conversations: Math.round(row.returning_conversations || 0)
          })));
        
        if (error) {
          console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
          throw error;
        }
        
        console.log(`  ✓ Inserted batch ${i / batchSize + 1} of ${Math.ceil(result.recordset.length / batchSize)}`);
      }
      
      console.log(`  ✅ Successfully synced ${result.recordset.length} records to seo_channels\n`);
      return;
    }
    
    // If seo_channels table exists in MSSQL, use it directly
    const result = await mssqlPool.request()
      .input('latestMonth', sql.Date, latestMonth)
      .query(`
        SELECT *
        FROM seo_channels
        WHERE month > @latestMonth
        ORDER BY month, clinic, traffic_source
      `);
    
    if (result.recordset.length === 0) {
      console.log('  ✓ No new records to sync');
      return;
    }
    
    console.log(`  Found ${result.recordset.length} new records to sync`);
    
    // Insert directly
    const { error } = await supabase
      .from('seo_channels')
      .insert(result.recordset);
    
    if (error) {
      console.error('  ❌ Error syncing seo_channels:', error.message);
      throw error;
    }
    
    console.log(`  ✅ Successfully synced ${result.recordset.length} records to seo_channels\n`);
    
  } catch (error) {
    console.error('  ❌ Error syncing seo_channels:', error.message);
    throw error;
  }
}

async function syncSeoKeywords(mssqlPool) {
  console.log('📊 Checking SEO keyword data...');
  console.log('-' . repeat(50));
  
  try {
    // Note: The seo_highlights_keyword_page_one table has a different structure
    // It appears to be for tracking keyword rankings rather than performance metrics
    console.log('  ℹ️  SEO keyword highlights table has different structure - skipping sync');
    console.log('  ℹ️  This table appears to track keyword rankings, not performance metrics\n');
    
  } catch (error) {
    console.error('  ❌ Error checking SEO keywords:', error.message);
  }
}

// Run the sync
syncAllData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});