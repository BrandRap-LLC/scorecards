-- Create paid_ads table
CREATE TABLE paid_ads (
  clinic text,
  month timestamp,
  traffic_source text,
  campaign text,
  impressions float,
  visits float,
  spend float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  avg_appointment_rev float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  total_conversations float,
  new_conversations float,
  returning_conversations float,
  conversation_rate float,
  appointment_rate float,
  ctr float
);

-- Create seo_channels table
CREATE TABLE seo_channels (
  clinic text,
  month timestamp,
  traffic_source text,
  impressions float,
  visits float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  avg_appointment_rev float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  total_conversations float,
  new_conversations float,
  returning_conversations float,
  conversation_rate float,
  appointment_rate float,
  ctr float
);

-- Create indexes for better performance
CREATE INDEX idx_paid_ads_clinic ON paid_ads(clinic);
CREATE INDEX idx_paid_ads_month ON paid_ads(month);
CREATE INDEX idx_paid_ads_traffic_source ON paid_ads(traffic_source);
CREATE INDEX idx_paid_ads_campaign ON paid_ads(campaign);

CREATE INDEX idx_seo_channels_clinic ON seo_channels(clinic);
CREATE INDEX idx_seo_channels_month ON seo_channels(month);
CREATE INDEX idx_seo_channels_traffic_source ON seo_channels(traffic_source);