# Percentage Formatting Guide

## Storage Format by Table

After investigating the database, we found that percentage values are stored differently in different tables:

### 1. executive_monthly_reports & executive_weekly_reports
- **Storage**: Percentages (e.g., 12 for 12%)
- **Formatting**: Just add `.toFixed(1) + '%'`
- **Example**: `12` → `12.0%`
- **Metrics**: total_conversion, new_conversion, returning_conversion

### 2. paid_ads & seo_channels
- **Storage**: Decimals (e.g., 0.494 for 49.4%)
- **Formatting**: Multiply by 100, then add `'%'`
- **Example**: `0.494` → `49.4%`
- **Metrics**: ctr, appointment_rate

## Component Formatting

### Components using percentage format (no multiplication):
- ChannelGrid.tsx
- MetricsGrid.tsx
- WeeklyMetricsGrid.tsx
- WeeklyChannelGrid.tsx

### Components using decimal format (multiply by 100):
- PaidChannelGrid.tsx
- SEOChannelGrid.tsx

## Code Examples

### For executive reports (stored as percentages):
```javascript
// Percentage metrics (already in percentage form from DB)
if (metric.includes('conversion') || metric.includes('rate')) {
  return value.toFixed(1) + '%'
}
```

### For paid/SEO data (stored as decimals):
```javascript
// CTR and rate metrics (stored as decimals in paid_ads/seo_channels)
if (metric === 'ctr' || metric.includes('rate')) {
  return (value * 100).toFixed(1) + '%'
}
```

## Summary
- Different tables use different storage formats for historical reasons
- The formatting in the UI components correctly handles these differences
- Always check the source table to determine the correct formatting approach