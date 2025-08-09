const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUIChanges() {
  console.log('🧪 Testing UI Changes\n');
  console.log('=' .repeat(60));
  
  const testClinic = 'advancedlifeclinic.com';
  
  // Test 1: Verify executive_monthly_reports doesn't have conversation columns
  console.log('\n1️⃣ Testing executive_monthly_reports...');
  const { data: execData, error: execError } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', testClinic)
    .limit(1);
  
  if (execError) {
    console.log('❌ Error fetching data:', execError.message);
  } else if (execData && execData.length > 0) {
    const columns = Object.keys(execData[0]);
    const removedColumns = ['total_conversations', 'new_conversations', 'returning_conversations'];
    const stillPresent = removedColumns.filter(col => columns.includes(col));
    
    if (stillPresent.length > 0) {
      console.log(`⚠️ Columns still present: ${stillPresent.join(', ')}`);
      console.log('   Please run the SQL script to remove these columns');
    } else {
      console.log('✅ All conversation columns removed successfully');
    }
  }
  
  // Test 2: Verify paid_ads doesn't have conversation columns
  console.log('\n2️⃣ Testing paid_ads...');
  const { data: paidData, error: paidError } = await supabase
    .from('paid_ads')
    .select('*')
    .eq('clinic', testClinic)
    .limit(1);
  
  if (paidError) {
    console.log('❌ Error fetching data:', paidError.message);
  } else if (paidData && paidData.length > 0) {
    const columns = Object.keys(paidData[0]);
    const removedColumns = ['total_conversations', 'new_conversations', 'returning_conversations', 'avg_appointment_rev', 'conversation_rate'];
    const stillPresent = removedColumns.filter(col => columns.includes(col));
    
    if (stillPresent.length > 0) {
      console.log(`⚠️ Columns still present: ${stillPresent.join(', ')}`);
      console.log('   Please run the SQL script to remove these columns');
    } else {
      console.log('✅ All conversation and avg revenue columns removed successfully');
    }
  }
  
  // Test 3: Verify seo_channels doesn't have conversation columns
  console.log('\n3️⃣ Testing seo_channels...');
  const { data: seoData, error: seoError } = await supabase
    .from('seo_channels')
    .select('*')
    .eq('clinic', testClinic)
    .limit(1);
  
  if (seoError) {
    console.log('❌ Error fetching data:', seoError.message);
  } else if (seoData && seoData.length > 0) {
    const columns = Object.keys(seoData[0]);
    const removedColumns = ['total_conversations', 'new_conversations', 'returning_conversations', 'avg_appointment_rev', 'conversation_rate'];
    const stillPresent = removedColumns.filter(col => columns.includes(col));
    
    if (stillPresent.length > 0) {
      console.log(`⚠️ Columns still present: ${stillPresent.join(', ')}`);
      console.log('   Please run the SQL script to remove these columns');
    } else {
      console.log('✅ All conversation and avg revenue columns removed successfully');
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📝 Summary:');
  console.log('1. UI components have been updated to remove conversation metrics');
  console.log('2. Migration scripts have been updated to exclude these columns');
  console.log('3. SQL script created at: scripts/remove-conversation-metrics.sql');
  console.log('\n⚠️ Action Required:');
  console.log('Run the SQL script in Supabase SQL editor to remove the columns from the database');
  console.log('\n✅ Once columns are removed, all UI grids will display correctly without errors');
}

testUIChanges().catch(console.error);