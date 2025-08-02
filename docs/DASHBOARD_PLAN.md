# Company Overview Dashboard Plan

## Data Source
**Single Table**: `executive_monthly_reports`
- 572 records of December 2024 data
- 11 unique clinics/companies
- 8 traffic sources
- 21 performance metrics

## Dashboard Architecture

### 1. Company Selection & Navigation
**Component**: Company Selector Dropdown/Tabs
- List all 11 clinics
- Default to first clinic alphabetically
- Persistent selection across page refreshes

### 2. Executive Summary Cards (Top Row)
**Purpose**: High-level KPIs at a glance

#### Card 1: Total Marketing Spend
- Sum of all `spend` across traffic sources
- Format: Currency (USD)
- Comparison: % of total spend vs other clinics

#### Card 2: Total Leads Generated
- Sum of all `leads` 
- Format: Number with commas
- Breakdown: New vs Returning (if data available)

#### Card 3: Total Appointments
- Sum of `total_appointments`
- Sub-metrics: `new_appointments`, `returning_appointments`
- Online booking rate: `online_booking / total_appointments`

#### Card 4: Overall Conversion Rate
- Weighted average `conversion_rate`
- Format: Percentage
- Color coding: Green (>70%), Yellow (40-70%), Red (<40%)

#### Card 5: ROI/ROAS
- Average `roas` where spend > 0
- Format: Multiplier (e.g., 2.5x)
- Indicator: Profit/Loss status

### 3. Traffic Source Performance Grid
**Component**: Data Table with Sparklines

| Traffic Source | Spend | Impressions | Visits | Leads | Conv % | CAC | ROAS |
|---------------|-------|-------------|---------|-------|---------|-----|------|
| Google Ads | $X | X | X | X | X% | $X | Xx |
| Local SEO | $X | X | X | X | X% | $X | Xx |
| Others | $X | X | X | X | X% | $X | Xx |

**Features**:
- Sortable columns
- Color-coded performance (best/worst)
- Expandable rows for detailed metrics

### 4. Marketing Funnel Visualization
**Component**: Horizontal Funnel Chart

```
Impressions → Visits → Leads → Appointments → Conversions
   (100%)      (X%)     (X%)      (X%)           (X%)
```

**Metrics Flow**:
1. Total Impressions (all sources)
2. Total Visits 
3. Total Leads
4. Total Appointments
5. Completed Conversions

**Drop-off Rates**: Show percentage lost at each stage

### 5. Cost Analysis Charts

#### 5.1 Spend Distribution (Pie/Donut Chart)
- Breakdown by traffic source
- Interactive: Click to filter other components
- Show actual amounts and percentages

#### 5.2 Cost Efficiency Matrix (Scatter Plot)
- X-axis: Spend
- Y-axis: Leads or Appointments
- Bubble size: Conversion Rate
- Quadrants: High Spend/High Return, etc.

### 6. Customer Journey Analytics

#### 6.1 New vs Returning Split (Stacked Bar)
- Appointments: `new_appointments` vs `returning_appointments`
- Conversations: `new_conversations` vs `returning_conversations`
- Show percentages and absolute numbers

#### 6.2 Engagement Metrics (Metric Cards)
- Total Conversations: Sum of `total_conversations`
- Online Booking Rate: `online_booking / total_appointments * 100`
- Response Rate: Conversations to Appointments ratio

### 7. Performance Indicators

#### 7.1 LTV Analysis (Bar Chart)
- `ltv`: Current lifetime value
- `estimated_ltv_6m`: 6-month projection
- `avg_ltv`: Average across customers
- Compare to CAC for profitability

#### 7.2 Acquisition Cost Trends
- `cac_total`: Overall customer acquisition cost
- `cac_new`: New customer acquisition cost
- Ratio comparison showing efficiency

### 8. Traffic Source Deep Dive (Expandable Sections)

For each traffic source, show:
- **Visibility**: Impressions, Click-through rate (Visits/Impressions)
- **Engagement**: Visits, Lead capture rate (Leads/Visits)
- **Conversion**: Appointments booked, Conversion rate
- **Revenue**: LTV, ROAS, Profit margin
- **Efficiency**: CAC, Cost per lead, Cost per appointment

### 9. Comparative Analysis (Optional View)

#### 9.1 Benchmark Against Other Clinics
- Radar chart comparing key metrics
- Percentile rankings
- Industry averages (if available)

#### 9.2 Traffic Source Ranking
- Best to worst performing channels
- Opportunity identification
- Investment recommendations

## Technical Implementation

### Data Aggregations Needed

```sql
-- Company Summary
SELECT 
  clinic,
  SUM(spend) as total_spend,
  SUM(impressions) as total_impressions,
  SUM(visits) as total_visits,
  SUM(leads) as total_leads,
  SUM(total_appointments) as total_appointments,
  AVG(conversion_rate) as avg_conversion_rate,
  AVG(roas) as avg_roas,
  SUM(new_appointments) as new_appointments,
  SUM(returning_appointments) as returning_appointments,
  SUM(online_booking) as online_bookings,
  SUM(total_conversations) as total_conversations
FROM executive_monthly_reports
WHERE clinic = :selected_clinic
GROUP BY clinic;

-- Traffic Source Breakdown
SELECT 
  traffic_source,
  spend,
  impressions,
  visits,
  leads,
  conversion_rate,
  CASE WHEN leads > 0 THEN spend / leads ELSE 0 END as cost_per_lead,
  roas,
  total_appointments,
  cac_total,
  cac_new
FROM executive_monthly_reports
WHERE clinic = :selected_clinic
ORDER BY spend DESC;
```

### Component Structure

```
/app/dashboard/
  /[company]/
    page.tsx                 # Main dashboard
    /components/
      CompanySelector.tsx    # Company dropdown/tabs
      KPICards.tsx          # Top summary cards
      TrafficSourceTable.tsx # Performance grid
      FunnelChart.tsx       # Marketing funnel
      SpendPieChart.tsx     # Spend distribution
      CostMatrix.tsx        # Efficiency scatter plot
      CustomerSplit.tsx     # New vs returning
      LTVAnalysis.tsx       # Lifetime value charts
      TrafficDeepDive.tsx   # Expandable detail sections
```

### Visual Design Principles

1. **Color Palette**:
   - Primary: Company brand colors
   - Success: Green (#10B981)
   - Warning: Yellow (#F59E0B)
   - Danger: Red (#EF4444)
   - Neutral: Grays for backgrounds

2. **Typography**:
   - Headers: Bold, clear hierarchy
   - Metrics: Large, readable numbers
   - Labels: Consistent, descriptive

3. **Layout**:
   - Responsive grid (12 columns)
   - Mobile-first design
   - Collapsible sections for mobile
   - Print-friendly version

4. **Interactivity**:
   - Hover tooltips for all metrics
   - Click to filter/drill down
   - Export to CSV/PDF
   - Share dashboard link

### Key Metrics Definitions

| Metric | Calculation | Format |
|--------|------------|--------|
| Click-through Rate | `visits / impressions * 100` | Percentage |
| Lead Capture Rate | `leads / visits * 100` | Percentage |
| Cost per Lead | `spend / leads` | Currency |
| Cost per Appointment | `spend / total_appointments` | Currency |
| Appointment Rate | `total_appointments / leads * 100` | Percentage |
| Online Booking Rate | `online_booking / total_appointments * 100` | Percentage |
| New Customer Rate | `new_appointments / total_appointments * 100` | Percentage |
| Conversation Rate | `total_conversations / leads * 100` | Percentage |
| ROI | `(ltv - spend) / spend * 100` | Percentage |
| Efficiency Score | `leads / spend * 1000` | Leads per $1k |

## Implementation Priorities

### Phase 1: Core Dashboard (MVP)
1. Company selector
2. KPI summary cards
3. Traffic source table
4. Basic spend pie chart

### Phase 2: Analytics
1. Marketing funnel
2. Cost efficiency matrix
3. New vs returning analysis
4. LTV charts

### Phase 3: Advanced Features
1. Traffic source deep dive
2. Comparative analysis
3. Export functionality
4. Custom date ranges (when more data available)

### Phase 4: Enhancements
1. Real-time data refresh
2. Alerts and notifications
3. Custom metric builder
4. Predictive analytics

## Success Metrics

1. **Page Load Time**: < 2 seconds
2. **Data Accuracy**: 100% match with source
3. **Mobile Responsiveness**: Full functionality on mobile
4. **User Engagement**: Average session > 3 minutes
5. **Export Usage**: > 20% of users export data

## Next Steps

1. Create TypeScript interfaces for data types
2. Build Supabase query functions
3. Implement component library (shadcn/ui recommended)
4. Design responsive layouts
5. Add chart libraries (Recharts/Chart.js)
6. Implement state management (Zustand/Context)
7. Add error handling and loading states
8. Create unit and integration tests