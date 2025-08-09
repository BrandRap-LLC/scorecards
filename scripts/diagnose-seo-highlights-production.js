const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the same environment variables as your production deployment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igzswopyyggvelncjmuh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTMxMzAsImV4cCI6MjA2OTU4OTEzMH0.g-EQYp4vKIYkztjotC1xTk1ox5CM5PxyJ7IZxst6o6I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseSEOHighlights() {
  console.log('🔍 Diagnosing SEO Highlights in Production...\n');
  
  try {
    // 1. Check if table exists
    console.log('1. Checking if seo_highlights_keyword_page_one table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('id')
      .limit(1);
    
    if (tableError) {
      if (tableError.code === '42P01') {
        console.error('❌ Table "seo_highlights_keyword_page_one" does NOT exist in production!');
        console.log('\n📋 To fix this issue, run the following SQL in your Supabase SQL editor:\n');
        
        const createTableSQL = `
-- Create the SEO highlights table
CREATE TABLE IF NOT EXISTS seo_highlights_keyword_page_one (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  query_group VARCHAR(255),
  query VARCHAR(500) NOT NULL,
  period DATE NOT NULL,
  period_type VARCHAR(50) NOT NULL,
  current_rank NUMERIC(10,2) NOT NULL,
  baseline_avg_rank NUMERIC(10,2) NOT NULL,
  highlight_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_highlights_company ON seo_highlights_keyword_page_one(company_name);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_period ON seo_highlights_keyword_page_one(period);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_period_type ON seo_highlights_keyword_page_one(period_type);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_rank ON seo_highlights_keyword_page_one(current_rank);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_query ON seo_highlights_keyword_page_one(query);

-- Grant permissions
GRANT ALL ON seo_highlights_keyword_page_one TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE seo_highlights_keyword_page_one_id_seq TO postgres, anon, authenticated, service_role;
`;
        
        console.log(createTableSQL);
        console.log('\n📌 After creating the table, you\'ll need to migrate the data from your MSSQL source.');
        return;
      } else {
        console.error('❌ Error checking table:', tableError.message);
        return;
      }
    }
    
    console.log('✅ Table exists!');
    
    // 2. Check if table has data
    console.log('\n2. Checking if table has data...');
    const { data: countData, error: countError, count } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting records:', countError.message);
      return;
    }
    
    if (count === 0) {
      console.error('❌ Table exists but has NO data!');
      console.log('\n📌 You need to migrate data from your MSSQL source.');
      console.log('   Run: node scripts/migrate-seo-highlights-simple.js');
      return;
    }
    
    console.log(`✅ Table has ${count} records`);
    
    // 3. Check sample data
    console.log('\n3. Checking sample data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*')
      .limit(5)
      .order('current_rank', { ascending: true });
    
    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError.message);
      return;
    }
    
    console.log('✅ Sample data:');
    sampleData.forEach(item => {
      console.log(`   - ${item.company_name}: "${item.query}" (Rank: ${item.current_rank})`);
    });
    
    // 4. Check for specific companies
    console.log('\n4. Checking data for all companies...');
    const companies = [
      'advancedlifeclinic.com',
      'alluraderm.com',
      'bismarckbotox.com',
      'drridha.com',
      'genesis-medspa.com',
      'greenspringaesthetics.com',
      'kovakcosmeticcenter.com',
      'mirabilemd.com',
      'myskintastic.com',
      'skincareinstitute.net',
      'skinjectables.com'
    ];
    
    for (const company of companies) {
      const { count: companyCount } = await supabase
        .from('seo_highlights_keyword_page_one')
        .select('*', { count: 'exact', head: true })
        .eq('company_name', company);
      
      if (companyCount > 0) {
        console.log(`   ✅ ${company}: ${companyCount} highlights`);
      } else {
        console.log(`   ❌ ${company}: No highlights found`);
      }
    }
    
    // 5. Test the API endpoint
    console.log('\n5. Testing the API endpoint...');
    const testClinic = 'advancedlifeclinic.com';
    console.log(`   Testing with clinic: ${testClinic}`);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/seo_highlights_keyword_page_one?company_name=eq.${testClinic}`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API returned ${data.length} results`);
      } else {
        console.log(`   ❌ API returned error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.log(`   ❌ API request failed:`, err.message);
    }
    
    console.log('\n✅ Diagnosis complete!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

diagnoseSEOHighlights();
