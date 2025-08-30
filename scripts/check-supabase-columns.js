const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    console.log('🔍 Checking Supabase table schemas...\n');
    
    // Check executive_monthly_reports
    console.log('📊 Testing executive_monthly_reports:');
    const { data: monthData, error: monthError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);
    
    if (monthError) {
      console.log('   ❌ Error:', monthError.message);
    } else if (monthData && monthData.length > 0) {
      console.log('   Available columns:', Object.keys(monthData[0]));
    } else {
      // Try to get column info via a different method
      const { error: insertError } = await supabase
        .from('executive_monthly_reports')
        .insert({})
        .single();
      
      if (insertError) {
        // Parse error message to understand schema
        console.log('   Schema hints from error:', insertError.message);
      }
    }
    
    // Check executive_weekly_reports
    console.log('\n📊 Testing executive_weekly_reports:');
    const { data: weekData, error: weekError } = await supabase
      .from('executive_weekly_reports')
      .select('*')
      .limit(1);
    
    if (weekError) {
      console.log('   ❌ Error:', weekError.message);
    } else if (weekData && weekData.length > 0) {
      console.log('   Available columns:', Object.keys(weekData[0]));
    } else {
      const { error: insertError } = await supabase
        .from('executive_weekly_reports')
        .insert({})
        .single();
      
      if (insertError) {
        console.log('   Schema hints from error:', insertError.message);
      }
    }
    
    // Check paid_ads
    console.log('\n📊 Testing paid_ads:');
    const { data: paidData, error: paidError } = await supabase
      .from('paid_ads')
      .select('*')
      .limit(1);
    
    if (paidError) {
      console.log('   ❌ Error:', paidError.message);
    } else if (paidData && paidData.length > 0) {
      console.log('   Available columns:', Object.keys(paidData[0]));
    } else {
      const { error: insertError } = await supabase
        .from('paid_ads')
        .insert({})
        .single();
      
      if (insertError) {
        console.log('   Schema hints from error:', insertError.message);
      }
    }
    
    // Check seo_channels
    console.log('\n📊 Testing seo_channels:');
    const { data: seoData, error: seoError } = await supabase
      .from('seo_channels')
      .select('*')
      .limit(1);
    
    if (seoError) {
      console.log('   ❌ Error:', seoError.message);
    } else if (seoData && seoData.length > 0) {
      console.log('   Available columns:', Object.keys(seoData[0]));
    } else {
      const { error: insertError } = await supabase
        .from('seo_channels')
        .insert({})
        .single();
      
      if (insertError) {
        console.log('   Schema hints from error:', insertError.message);
      }
    }
    
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkColumns();