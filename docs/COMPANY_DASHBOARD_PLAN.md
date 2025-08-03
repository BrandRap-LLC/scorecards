# Company Dashboard Plan - Executive Monthly Reports

## Overview
Comprehensive dashboard for each clinic/company using the enhanced `executive_monthly_reports` table with new vs returning customer segmentation.

## Data Source
**Single Table:** `executive_monthly_reports`
- **Date Range:** December 2024 - August 2025
- **Clinics:** 11 unique companies
- **Traffic Sources:** 8 channels (Google Ads, Local SEO, Organic SEO, Social Ads, Organic Social, Reactivation, Others, Test)

## Dashboard Structure

### 1. Header Section
```
┌────────────────────────────────────────────────────────────────┐
│  [Company Logo]  COMPANY NAME DASHBOARD                        │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │ Date Range │  │ Traffic Source│  │ Compare Period │       │
│  └────────────┘  └──────────────┘  └────────────────┘       │
└────────────────────────────────────────────────────────────────┘
```

### 2. Key Performance Indicators (KPIs) Row
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Revenue   │    ROAS     │    Leads    │ Conversion  │     CAC     │
│  $125,430   │    3.45     │     234     │   12.5%     │    $245     │
│   ↑ 23%     │   ↑ 0.8     │   ↑ 45      │   ↑ 2.1%    │   ↓ $30     │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ New: $45K   │ New: 2.1    │ New: 145    │ New: 8.5%   │ New: $320   │
│ Ret: $80K   │ Ret: 4.8    │ Ret: 89     │ Ret: 16.3%  │ Ret: $125   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### 3. Main Visualization Grid

#### Row 1: Financial Performance
```
┌──────────────────────────────┬──────────────────────────────┐
│  Revenue Trend               │  ROAS by Traffic Source      │
│  [Line Chart]                │  [Horizontal Bar Chart]      │
│  - Total Revenue             │  Google Ads    ████ 4.2     │
│  - New Customer Revenue      │  Local SEO     ███  3.8     │
│  - Returning Revenue         │  Social Ads    ██   2.1     │
└──────────────────────────────┴──────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│  Customer Lifetime Value     │  Cost Analysis               │
│  [Combo Chart]               │  [Stacked Area Chart]        │
│  - Avg LTV (Bar)             │  - Ad Spend                 │
│  - 6-Month Est LTV (Line)    │  - CAC Total                 │
│  - Avg Appointment Rev       │  - CAC New vs Returning     │
└──────────────────────────────┴──────────────────────────────┘
```

#### Row 2: Customer Acquisition & Conversion
```
┌──────────────────────────────┬──────────────────────────────┐
│  Lead Generation Funnel      │  Conversion Rate Trends      │
│  [Funnel Chart]              │  [Multi-Line Chart]          │
│  Impressions: 125,000        │  - Total Conversion Rate    │
│  Visits: 8,500               │  - New Customer Conv Rate   │
│  Leads: 234                  │  - Returning Conv Rate      │
│  Appointments: 89            │  By Traffic Source           │
└──────────────────────────────┴──────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│  New vs Returning Breakdown │  Traffic Source Performance  │
│  [Donut Charts Side-by-Side] │  [Heat Map]                 │
│  Leads | Appointments | Rev  │  Metrics x Traffic Sources  │
│  60/40 | 55/45 | 35/65      │  Color intensity = performance│
└──────────────────────────────┴──────────────────────────────┘
```

#### Row 3: Engagement & Operations
```
┌──────────────────────────────┬──────────────────────────────┐
│  Customer Conversations      │  Appointment Analytics       │
│  [Stacked Bar Chart]         │  [Mixed Chart]               │
│  - New Conversations         │  - Total Appointments (Bar)  │
│  - Returning Conversations   │  - Online Booking % (Line)   │
│  - Response Rate             │  - Avg Revenue/Appt (Line)   │
└──────────────────────────────┴──────────────────────────────┘
```

### 4. Traffic Source Comparison Table
```
┌────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Source     │Spend │Leads │ ROAS │Conv% │ CAC  │Revenue│ ROI  │
├────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│Google Ads  │ $25K │  125 │ 4.2  │12.5% │ $200 │$105K │ 320% │
│Local SEO   │ $8K  │   45 │ 3.8  │10.2% │ $178 │ $30K │ 275% │
│Social Ads  │ $12K │   38 │ 2.1  │ 7.8% │ $316 │ $25K │ 108% │
│Organic SEO │  $0  │   15 │  ∞   │15.3% │  $0  │ $18K │  ∞   │
│Reactivation│ $2K  │   11 │ 6.5  │22.1% │ $182 │ $13K │ 550% │
└────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

## Component Specifications

### 1. KPI Cards
- **Primary Metric:** Large, bold display
- **Comparison:** MoM or YoY change with trend arrow
- **Segmentation:** New vs Returning breakdown
- **Color Coding:** Green (positive), Red (negative), Gray (neutral)

### 2. Time Series Charts
- **Granularity:** Monthly with option for weekly
- **Interactions:** Hover for details, click to drill down
- **Legends:** Interactive, click to show/hide series
- **Annotations:** Mark significant events or campaigns

### 3. Segmentation Charts
- **New vs Returning:** Consistent color scheme throughout
  - New Customers: Blue palette (#3B82F6)
  - Returning Customers: Green palette (#10B981)
- **Traffic Sources:** Fixed color mapping for consistency

### 4. Performance Matrices
- **Heat Maps:** 
  - Metrics: ROAS, Conversion Rate, CAC, Revenue
  - Dimensions: Traffic Source × Month
  - Color Scale: Red (poor) → Yellow (average) → Green (excellent)

### 5. Funnel Visualizations
- **Stages:** Impressions → Visits → Leads → Appointments → Revenue
- **Conversion Rates:** Display between each stage
- **Segmentation:** Option to filter by traffic source

## Filtering & Interactivity

### Global Filters
1. **Date Range Selector**
   - Preset: Last 30 days, Last 3 months, YTD, Custom
   - Comparison: Previous period, Same period last year

2. **Traffic Source Filter**
   - Multi-select dropdown
   - "All" option selected by default
   - Quick filters: Paid, Organic, Direct

3. **Customer Type Toggle**
   - All Customers (default)
   - New Customers Only
   - Returning Customers Only

### Interactive Features
1. **Drill-Down:** Click any metric to see detailed breakdown
2. **Export:** Download as PDF, PNG, or CSV
3. **Annotations:** Add notes to specific data points
4. **Alerts:** Set thresholds for key metrics
5. **Comparison Mode:** Compare up to 3 clinics side-by-side

## Technical Implementation

### Data Aggregation Queries

```sql
-- Main KPI Query
SELECT 
  clinic,
  DATE_TRUNC('month', month) as period,
  SUM(total_estimated_revenue) as total_revenue,
  SUM(new_estimated_revenue) as new_revenue,
  AVG(total_roas) as avg_total_roas,
  AVG(new_roas) as avg_new_roas,
  SUM(leads) as total_leads,
  SUM(new_leads) as new_leads,
  AVG(total_conversion) as avg_conversion,
  AVG(cac_total) as avg_cac
FROM executive_monthly_reports
WHERE clinic = $1
  AND month BETWEEN $2 AND $3
GROUP BY clinic, period
ORDER BY period DESC;

-- Traffic Source Performance
SELECT 
  traffic_source,
  SUM(spend) as total_spend,
  SUM(total_estimated_revenue) as revenue,
  AVG(total_roas) as roas,
  SUM(leads) as leads,
  AVG(total_conversion) as conversion_rate,
  CASE 
    WHEN SUM(leads) > 0 THEN SUM(spend) / SUM(leads)
    ELSE 0
  END as cac
FROM executive_monthly_reports
WHERE clinic = $1
  AND month BETWEEN $2 AND $3
GROUP BY traffic_source
ORDER BY revenue DESC;
```

### Component Library
- **Framework:** React/Next.js
- **Charts:** Recharts or Chart.js
- **UI Components:** Shadcn/ui or Material-UI
- **State Management:** React Context or Zustand
- **Data Fetching:** React Query or SWR

### Performance Considerations
1. **Data Caching:** Cache aggregated results for 5 minutes
2. **Lazy Loading:** Load charts as they enter viewport
3. **Pagination:** Limit table rows to 20 per page
4. **Optimistic Updates:** Show loading states immediately
5. **Progressive Enhancement:** Basic functionality without JS

## Mobile Responsiveness

### Breakpoints
- **Desktop:** 1280px+ (Full dashboard)
- **Tablet:** 768px-1279px (2-column grid)
- **Mobile:** <768px (Single column, stacked)

### Mobile Optimizations
1. **Swipeable Charts:** Horizontal scroll for wide charts
2. **Collapsible Sections:** Accordion-style for space saving
3. **Bottom Sheet Filters:** Slide-up panel for filter options
4. **Simplified Tables:** Key columns only, expandable rows

## Success Metrics

### Dashboard Performance
- **Load Time:** < 2 seconds initial load
- **Interaction Response:** < 100ms for user actions
- **Data Freshness:** Real-time or < 5 minute delay

### User Engagement
- **Daily Active Users:** Track unique daily visitors
- **Average Session Duration:** Target > 3 minutes
- **Feature Adoption:** Monitor filter and export usage
- **Return Rate:** Users visiting dashboard multiple times

## Implementation Phases

### Phase 1: Core Dashboard (Week 1)
- [ ] KPI cards with basic metrics
- [ ] Revenue and ROAS trend charts
- [ ] Traffic source performance table
- [ ] Basic date range filtering

### Phase 2: Advanced Analytics (Week 2)
- [ ] New vs Returning segmentation
- [ ] Conversion funnel visualization
- [ ] Heat map for performance matrix
- [ ] Customer lifetime value analysis

### Phase 3: Interactivity & Polish (Week 3)
- [ ] Drill-down capabilities
- [ ] Export functionality
- [ ] Mobile responsive design
- [ ] Performance optimizations

### Phase 4: Extended Features (Week 4)
- [ ] Multi-clinic comparison
- [ ] Custom alerts and notifications
- [ ] Saved views and preferences
- [ ] API for external integrations

## Dashboard Mockup

```
╔══════════════════════════════════════════════════════════════════╗
║                    CLINIC NAME DASHBOARD                         ║
║  [📅 Jan-Aug 2025 ▼] [🎯 All Sources ▼] [📊 Compare: Last Year] ║
╠══════════════════════════════════════════════════════════════════╣
║  💰 Revenue        📈 ROAS         👥 Leads        🎯 Conv Rate  ║
║  $487,250         3.85            1,234           12.8%         ║
║  ↑ 34% MoM        ↑ 0.95          ↑ 234           ↑ 2.3%        ║
╠══════════════════════════════════════════════════════════════════╣
║  ┌─ Revenue Trend ─────────┐  ┌─ ROAS by Source ──────────┐    ║
║  │     /\    Total         │  │ Google Ads  ████████ 4.5  │    ║
║  │    /  \   New ····      │  │ Local SEO   ██████   3.8  │    ║
║  │   /    \_/Returning --- │  │ Social      ████     2.2  │    ║
║  └─────────────────────────┘  └───────────────────────────┘    ║
║  ┌─ Lead Funnel ───────────┐  ┌─ New vs Returning ────────┐    ║
║  │ █████████ Impressions   │  │    👤 New    👥 Returning  │    ║
║  │  ██████ Visits          │  │ Leads:  62%      38%      │    ║
║  │   ███ Leads             │  │ Revenue: 41%      59%      │    ║
║  │    █ Appointments       │  │ ROAS:   2.8       4.9      │    ║
║  └─────────────────────────┘  └───────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════╝
```

## Next Steps

1. **Validate Requirements:** Review plan with stakeholders
2. **Design System:** Create component library and style guide
3. **API Development:** Build efficient data aggregation endpoints
4. **Frontend Development:** Implement dashboard components
5. **Testing:** Unit tests, integration tests, user acceptance
6. **Deployment:** Staged rollout with monitoring
7. **Training:** User documentation and video tutorials