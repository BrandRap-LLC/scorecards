# Tooltip Descriptions Update

## Updated Metric Descriptions

The following metric tooltips have been updated as requested:

### 1. Lead Metrics
- **leads** & **new_leads**: 
  - Old: "Total leads from first-time prospects"
  - New: "People contacting the clinic for the first time (calls, forms, or online bookings)"

- **returning_leads**: 
  - Old: "Total leads from existing patients"
  - New: "Existing patients making new contact (calls, forms, or online bookings)"

### 2. Revenue Metrics
- **appointment_est_revenue** (NEW):
  - "Estimated revenue from appointments (total appointments × average revenue per appointment)"

- **new_appointment_est_6m_revenue** (NEW):
  - "Projected 6-month revenue from new patients (new appointments × average revenue per appointment × 2)"

### 3. Additional Metrics Added
- **appointment_rate**: "Percentage of visits that result in booked appointments"
- **ctr**: "Click-through rate - percentage of impressions that result in clicks/visits"

## File Updated
- `/lib/metric-descriptions.ts`

## Where These Tooltips Appear
These descriptions will show as tooltips when users hover over the metric labels in:
- Overview tab (Monthly/Weekly views)
- Channel Breakdown tab
- Paid tab
- SEO tab

## Testing
To see the updated tooltips:
1. Run `npm run dev`
2. Navigate to any dashboard tab
3. Hover over the metric labels to see the new descriptions