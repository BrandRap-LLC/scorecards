const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSwappedRecords() {
  console.log('🔧 Fixing swapped records in paid_ads table...\n');
  
  try {
    // First, get the current records
    const { data: records } = await supabase
      .from('paid_ads')
      .select('*')
      .eq('clinic', 'alluraderm.com')
      .eq('traffic_source', 'social ads')
      .gte('month', '2025-05-01')
      .lt('month', '2025-06-01')
      .in('campaign', ['BR_AD_Lead_Schedule - OFF', 'BR_AD_Lead_Schedule - Off']);
    
    console.log('Found records to fix:', records.length);
    
    if (records.length === 2) {
      const record1 = records.find(r => r.campaign === 'BR_AD_Lead_Schedule - OFF');
      const record2 = records.find(r => r.campaign === 'BR_AD_Lead_Schedule - Off');
      
      console.log('\nCurrent state:');
      console.log(`Record 1 (OFF): impressions=${record1.impressions}, visits=${record1.visits}, spend=${record1.spend}`);
      console.log(`Record 2 (Off): impressions=${record2.impressions}, visits=${record2.visits}, spend=${record2.spend}`);
      
      // The correct values based on MSSQL:
      // "BR_AD_Lead_Schedule - OFF" should have: impressions=3267, visits=62, spend=38.50
      // "BR_AD_Lead_Schedule - Off" should have: impressions=7820, visits=183, spend=156.05
      
      // Update first record (OFF)
      const { error: error1 } = await supabase
        .from('paid_ads')
        .update({
          impressions: 3267,
          visits: 62,
          spend: 38.50,
          ctr: 0.018977655341291706
        })
        .eq('clinic', 'alluraderm.com')
        .eq('traffic_source', 'social ads')
        .eq('campaign', 'BR_AD_Lead_Schedule - OFF')
        .gte('month', '2025-05-01')
        .lt('month', '2025-06-01');
      
      if (error1) {
        console.error('Error updating record 1:', error1);
        return;
      }
      
      // Update second record (Off)
      const { error: error2 } = await supabase
        .from('paid_ads')
        .update({
          impressions: 7820,
          visits: 183,
          spend: 156.05,
          ctr: 0.02340153452685422
        })
        .eq('clinic', 'alluraderm.com')
        .eq('traffic_source', 'social ads')
        .eq('campaign', 'BR_AD_Lead_Schedule - Off')
        .gte('month', '2025-05-01')
        .lt('month', '2025-06-01');
      
      if (error2) {
        console.error('Error updating record 2:', error2);
        return;
      }
      
      console.log('\n✅ Records fixed successfully!');
      
      // Verify the fix
      const { data: fixedRecords } = await supabase
        .from('paid_ads')
        .select('campaign, impressions, visits, spend, ctr')
        .eq('clinic', 'alluraderm.com')
        .eq('traffic_source', 'social ads')
        .gte('month', '2025-05-01')
        .lt('month', '2025-06-01')
        .in('campaign', ['BR_AD_Lead_Schedule - OFF', 'BR_AD_Lead_Schedule - Off']);
      
      console.log('\nVerification - Updated records:');
      fixedRecords.forEach(r => {
        console.log(`${r.campaign}: impressions=${r.impressions}, visits=${r.visits}, spend=${r.spend}`);
      });
      
    } else {
      console.log('❌ Expected exactly 2 records, found:', records.length);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

fixSwappedRecords();