const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSchemas() {
  try {
    console.log('🔍 Getting Supabase table schemas via SQL...\n');
    
    // Query for executive_monthly_reports schema
    const monthSchema = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'executive_monthly_reports'
        ORDER BY ordinal_position
      `
    });
    
    console.log('📊 executive_monthly_reports columns:');
    if (monthSchema.data) {
      monthSchema.data.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      // Alternative approach using direct SQL
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .select()
        .limit(0);
      
      if (!error) {
        console.log('   Table exists but getting schema failed');
      }
    }
    
    // Let's try a simpler approach - insert a test record to see what columns are required
    console.log('\n📊 Testing executive_monthly_reports insert with mapped columns:');
    const testData = {
      clinic: 'TEST',
      month: '2024-01-01',
      traffic_source: 'TEST',
      impressions: 0,
      visits: 0,
      spend: 0,
      leads: 0,
      conversion_rate: 0,
      cost_per_lead: 0,
      appointments_total: 0,
      appointments_new: 0,
      appointments_returning: 0,
      appointments_online: 0,
      conversations_total: 0,
      conversations_new: 0,
      conversations_returning: 0,
      cac_total: 0,
      cac_new: 0,
      ltv: 0,
      estimated_ltv_6m: 0,
      avg_ltv: 0,
      roas: 0,
      percent_new_conversion: 0,
      percent_returning_conversion: 0
    };
    
    const { error: insertError } = await supabase
      .from('executive_monthly_reports')
      .insert(testData)
      .single();
    
    if (insertError) {
      console.log('   Error details:', insertError.message);
      console.log('   This tells us which columns are missing or misnamed');
    } else {
      console.log('   ✅ Test insert successful with these columns');
      // Clean up test data
      await supabase
        .from('executive_monthly_reports')
        .delete()
        .eq('clinic', 'TEST');
    }
    
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getSchemas();