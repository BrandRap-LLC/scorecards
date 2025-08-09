const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConversionFormatting() {
  console.log('🔍 Testing Conversion Percentage Formatting\n');
  console.log('=' .repeat(60));
  
  // Get some conversion data
  const { data } = await supabase
    .from('executive_monthly_reports')
    .select('clinic, traffic_source, total_conversion, new_conversion, returning_conversion')
    .or('total_conversion.gt.0,new_conversion.gt.0,returning_conversion.gt.0')
    .limit(10);
  
  console.log('\n📊 Sample Conversion Data:\n');
  
  if (data && data.length > 0) {
    data.forEach(row => {
      console.log(`${row.clinic} - ${row.traffic_source}:`);
      
      // Show raw values
      console.log('  Raw values:');
      console.log(`    total_conversion: ${row.total_conversion}`);
      console.log(`    new_conversion: ${row.new_conversion}`);
      console.log(`    returning_conversion: ${row.returning_conversion}`);
      
      // Show formatted values (new formatting)
      console.log('  Formatted (× 100, no decimals):');
      console.log(`    total_conversion: ${Math.round(row.total_conversion * 100)}%`);
      console.log(`    new_conversion: ${Math.round(row.new_conversion * 100)}%`);
      console.log(`    returning_conversion: ${Math.round(row.returning_conversion * 100)}%`);
      
      console.log();
    });
  } else {
    console.log('No conversion data found');
  }
  
  console.log('=' .repeat(60));
  console.log('\n✅ Formatting Update Complete:');
  console.log('- Conversion percentages now multiply by 100');
  console.log('- No decimal points (using Math.round)');
  console.log('- Example: 0.12 → 12%, 2.33 → 233%');
}

testConversionFormatting().catch(console.error);