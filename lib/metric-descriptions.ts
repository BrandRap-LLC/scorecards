// Metric descriptions for tooltips
export const metricDescriptions: Record<string, string> = {
  // Traffic & Engagement
  'impressions': 'Number of times content was displayed to users (includes paid and organic traffic channels)',
  'visits': 'Number of unique visitors to the website',
  'leads': 'People contacting the clinic for the first time (calls, forms, or online bookings)',
  'new_leads': 'People contacting the clinic for the first time (calls, forms, or online bookings)',
  'returning_leads': 'Existing patients making new contact (calls, forms, or online bookings)',
  
  // Conversion Metrics
  'total_conversion': 'Overall percentage of visits that became leads',
  'new_conversion': 'Percentage of visits from new users that became leads',
  'returning_conversion': 'Percentage of visits from returning users that became leads',
  'conversion_rate': 'Overall percentage of visits that became leads',
  'total_appointments': 'All appointments booked (new + returning patients)',
  'new_appointments': 'Appointments booked by first-time patients',
  'returning_appointments': 'Appointments booked by existing patients',
  'online_booking': 'Appointments scheduled through online booking system',
  
  // Conversations
  'total_conversations': 'All phone calls and chats (new + returning)',
  'new_conversations': 'Phone calls and chats from first-time prospects',
  'returning_conversations': 'Phone calls and chats from existing patients',
  
  // Financial Performance
  'spend': 'Total amount spent on paid advertising campaigns',
  'total_estimated_revenue': 'Total estimated revenue (new + returning patients)',
  'new_estimated_revenue': 'Estimated revenue generated from new patients',
  'appointment_est_revenue': 'Estimated revenue from appointments (total appointments × average revenue per appointment)',
  'new_appointment_est_6m_revenue': 'Projected 6-month revenue from new patients (new appointments × average revenue per appointment × 2)',
  
  // ROI Metrics
  'total_roas': 'Overall return on ad spend (new + returning customers)',
  'new_roas': 'Return on ad spend from new customers only',
  'cac_total': 'Average cost to acquire any customer (new + returning)',
  'cac_new': 'Average cost to acquire one new customer',
  
  // Lifetime Value
  'estimated_ltv_6m': 'Predicted customer lifetime value over 6 months',
  
  // Additional Metrics
  'appointment_rate': 'Percentage of visits that result in booked appointments',
  'ctr': 'Click-through rate - percentage of impressions that result in clicks/visits'
};