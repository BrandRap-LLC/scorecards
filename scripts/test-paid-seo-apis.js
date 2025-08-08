async function testAPIs() {
  const baseUrl = 'http://localhost:3001';
  const testClinic = 'advancedlifeclinic.com';
  
  console.log('🧪 Testing Paid Ads and SEO APIs...\n');
  
  // Test Paid Ads API
  console.log('1. Testing Paid Ads API:');
  try {
    const paidResponse = await fetch(`${baseUrl}/api/paid-ads?clinic=${testClinic}`);
    const paidData = await paidResponse.json();
    
    if (paidResponse.ok) {
      console.log(`✅ Success! Retrieved ${paidData.length} paid ads records`);
      if (paidData.length > 0) {
        console.log('Sample record:', {
          clinic: paidData[0].clinic,
          month: paidData[0].month,
          campaign: paidData[0].campaign,
          spend: paidData[0].spend
        });
      }
    } else {
      console.log('❌ Error:', paidData.error);
    }
  } catch (error) {
    console.log('❌ Failed to fetch:', error.message);
  }
  
  // Test SEO Channels API
  console.log('\n2. Testing SEO Channels API:');
  try {
    const seoResponse = await fetch(`${baseUrl}/api/seo-channels?clinic=${testClinic}`);
    const seoData = await seoResponse.json();
    
    if (seoResponse.ok) {
      console.log(`✅ Success! Retrieved ${seoData.length} SEO records`);
      if (seoData.length > 0) {
        console.log('Sample record:', {
          clinic: seoData[0].clinic,
          month: seoData[0].month,
          traffic_source: seoData[0].traffic_source,
          visits: seoData[0].visits
        });
      }
    } else {
      console.log('❌ Error:', seoData.error);
    }
  } catch (error) {
    console.log('❌ Failed to fetch:', error.message);
  }
  
  console.log('\n✅ API testing complete!');
  console.log(`\nVisit http://localhost:3001/marketing/${testClinic} to see the new tabs`);
}

testAPIs();