// Test the SEO highlights API endpoint in production
const productionUrl = process.argv[2] || 'https://scorecards.vercel.app'; // Replace with your actual Vercel URL

async function testSEOHighlightsAPI() {
  console.log('🔍 Testing SEO Highlights API in production...\n');
  console.log(`Testing URL: ${productionUrl}`);
  
  const testClinics = [
    'advancedlifeclinic.com',
    'alluraderm.com',
    'genesis-medspa.com',
    'kovakcosmeticcenter.com'
  ];
  
  for (const clinic of testClinics) {
    console.log(`\nTesting clinic: ${clinic}`);
    
    try {
      const url = `${productionUrl}/api/seo-highlights?clinic=${clinic}`;
      console.log(`  Fetching: ${url}`);
      
      const response = await fetch(url);
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`  Content-Type: ${contentType}`);
      
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        
        if (data.error) {
          console.log(`  ❌ Error: ${data.error}`);
          console.log(`  Details: ${data.details}`);
          if (data.code) console.log(`  Code: ${data.code}`);
          if (data.solution) console.log(`  Solution: ${data.solution}`);
        } else if (Array.isArray(data)) {
          console.log(`  ✅ Success: ${data.length} highlights returned`);
          if (data.length > 0) {
            console.log(`  Sample: "${data[0].query}" (Rank: ${data[0].current_rank})`);
          }
        } else {
          console.log(`  ⚠️ Unexpected response format:`, data);
        }
      } catch (parseError) {
        console.log(`  ❌ Failed to parse JSON:`, text.substring(0, 200));
      }
      
    } catch (err) {
      console.log(`  ❌ Network error:`, err.message);
    }
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. If you see 404 errors, the API route might not be deployed');
  console.log('2. If you see 500 errors with "Table not found", run the table creation script');
  console.log('3. If you see CORS errors, check Vercel settings');
  console.log('4. Check the browser console on your deployed site for client-side errors');
}

testSEOHighlightsAPI();
