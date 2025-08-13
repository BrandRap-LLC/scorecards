-- Update Supabase tables to match MSSQL schema exactly
-- This script will modify paid_ads and seo_channels tables

-- ========================================
-- 1. UPDATE paid_ads TABLE
-- ========================================

-- First, drop the existing paid_ads table and recreate it with MSSQL schema
DROP TABLE IF EXISTS paid_ads CASCADE;

CREATE TABLE paid_ads (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR NOT NULL,
  month DATE NOT NULL,
  traffic_source VARCHAR NOT NULL,
  campaign VARCHAR NOT NULL,
  impressions NUMERIC,
  visits NUMERIC,
  spend NUMERIC,
  estimated_ltv_6m NUMERIC,
  total_roas NUMERIC,
  new_roas NUMERIC,
  leads NUMERIC,
  new_leads NUMERIC,
  returning_leads NUMERIC,
  total_conversion NUMERIC, -- renamed from %total_conversion
  new_conversion NUMERIC,   -- renamed from %new_conversion
  returning_conversion NUMERIC, -- renamed from %returning_conversion
  cac_total NUMERIC,
  cac_new NUMERIC,
  total_estimated_revenue NUMERIC,
  new_estimated_revenue NUMERIC,
  total_appointments NUMERIC,
  new_appointments NUMERIC,
  returning_appointments NUMERIC,
  total_conversations NUMERIC,
  new_conversations NUMERIC,
  returning_conversations NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_paid_ads_clinic ON paid_ads(clinic);
CREATE INDEX idx_paid_ads_month ON paid_ads(month);
CREATE INDEX idx_paid_ads_traffic_source ON paid_ads(traffic_source);
CREATE INDEX idx_paid_ads_campaign ON paid_ads(campaign);
CREATE INDEX idx_paid_ads_clinic_month ON paid_ads(clinic, month);

-- ========================================
-- 2. UPDATE seo_channels TABLE
-- ========================================

-- Drop and recreate seo_channels table with MSSQL schema
DROP TABLE IF EXISTS seo_channels CASCADE;

CREATE TABLE seo_channels (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR NOT NULL,
  month DATE NOT NULL,
  traffic_source VARCHAR NOT NULL,
  impressions NUMERIC,
  visits NUMERIC,
  estimated_ltv_6m NUMERIC,
  leads NUMERIC,
  new_leads NUMERIC,
  returning_leads NUMERIC,
  total_conversion NUMERIC, -- renamed from %total_conversion
  new_conversion NUMERIC,   -- renamed from %new_conversion
  returning_conversion NUMERIC, -- renamed from %returning_conversion
  total_estimated_revenue NUMERIC,
  new_estimated_revenue NUMERIC,
  total_appointments NUMERIC,
  new_appointments NUMERIC,
  returning_appointments NUMERIC,
  total_conversations NUMERIC,
  new_conversations NUMERIC,
  returning_conversations NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_seo_channels_clinic ON seo_channels(clinic);
CREATE INDEX idx_seo_channels_month ON seo_channels(month);
CREATE INDEX idx_seo_channels_traffic_source ON seo_channels(traffic_source);
CREATE INDEX idx_seo_channels_clinic_month ON seo_channels(clinic, month);

-- ========================================
-- 3. Add RLS (Row Level Security) if needed
-- ========================================

-- Enable RLS
ALTER TABLE paid_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_channels ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
-- For now, creating a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON paid_ads
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON seo_channels
  FOR ALL USING (auth.role() = 'authenticated');

-- For public read access (if needed)
CREATE POLICY "Allow public read" ON paid_ads
  FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON seo_channels
  FOR SELECT USING (true);

-- ========================================
-- 4. Create update trigger for updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paid_ads_updated_at BEFORE UPDATE ON paid_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_channels_updated_at BEFORE UPDATE ON seo_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. Grant permissions
-- ========================================

GRANT ALL ON paid_ads TO authenticated;
GRANT SELECT ON paid_ads TO anon;
GRANT ALL ON seo_channels TO authenticated;
GRANT SELECT ON seo_channels TO anon;

-- Grant sequence permissions for the id columns
GRANT USAGE, SELECT ON SEQUENCE paid_ads_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE paid_ads_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE seo_channels_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE seo_channels_id_seq TO anon;

-- ========================================
-- Verification queries
-- ========================================

-- Check the new table structures
SELECT 
  'paid_ads' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'paid_ads'
ORDER BY ordinal_position;

SELECT 
  'seo_channels' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seo_channels'
ORDER BY ordinal_position;