# Marketing Channel Performance Dashboard Plan

## Overview
Marketing-focused dashboard for analyzing channel performance, efficiency, and optimization opportunities across all traffic sources. Each of the 11 clinics will have their own dedicated dashboard instance.

## Multi-Company Structure
- **11 Separate Dashboards**: One for each clinic/company
- **Company Selection**: Dropdown selector or dedicated URL per company
- **Data Isolation**: Each dashboard shows only that company's data
- **Consistent Layout**: Same template and metrics across all companies
- **Cross-Company View**: Optional admin view to compare all clinics (Phase 2)

## Data Source
**Table:** `executive_monthly_reports`
- **Company Field:** `clinic` (11 unique values)
- **Focus:** Channel/Traffic Source Performance Analysis per company
- **Traffic Sources:** Google Ads, Local SEO, Organic SEO, Social Ads, Organic Social, Reactivation, Others, Test

## Dashboard Structure

### 1. Header Section
```
┌────────────────────────────────────────────────────────────────┐
│  📊 MARKETING PERFORMANCE DASHBOARD - [CLINIC NAME]            │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │ Date Range │  │ View: Monthly │  │ Export Report  │       │
│  └────────────┘  └──────────────┘  └────────────────┘       │
└────────────────────────────────────────────────────────────────┘
```
**Dynamic Title**: Clinic name pulled from selected company (e.g., "advancedlifeclinic.com", "alluraderm.com", etc.)

### 2. Channel Performance Summary Cards
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Spend │ Total Leads │  Avg ROAS   │  Avg Conv % │  Avg CAC    │
│  $125,430   │    1,234    │    3.45     │    12.5%    │    $245     │
│   ↑ 23%     │   ↑ 145     │   ↑ 0.8     │   ↑ 2.1%    │   ↓ $30     │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### 3. Main Channel Analysis Grid

#### Section A: Channel Mix & Budget Allocation
```
┌──────────────────────────────┬──────────────────────────────┐
│  Channel Mix (Spend)         │  Channel Mix (Leads)         │
│  [Donut Chart]               │  [Donut Chart]               │
│  Google Ads     45% ($56K)   │  Google Ads      52% (641)   │
│  Social Ads     25% ($31K)   │  Local SEO       18% (222)   │
│  Local SEO      20% ($25K)   │  Social Ads      15% (185)   │
│  Reactivation   10% ($13K)   │  Organic SEO     10% (123)   │
└──────────────────────────────┴──────────────────────────────┘
```

#### Section B: Channel Efficiency Metrics
```
┌────────────────────────────────────────────────────────────────┐
│  Channel Performance Matrix                                    │
│  [Bubble Chart: X=Spend, Y=ROAS, Size=Leads]                 │
│                                                                │
│     ROAS                                                      │
│      6 │                    ◯ Reactivation                    │
│      5 │                                                      │
│      4 │         ● Google Ads                                 │
│      3 │                        ◉ Local SEO                   │
│      2 │   ○ Social Ads                                       │
│      1 │                                   ◦ Others          │
│      0 └────────────────────────────────────────────         │
│        0    10K    20K    30K    40K    50K    Spend         │
└────────────────────────────────────────────────────────────────┘
```

#### Section C: Channel Trends Over Time
```
┌────────────────────────────────────────────────────────────────┐
│  Monthly Channel Performance Trends                            │
│  [Multi-Line Chart with Channel Selector]                      │
│                                                                │
│  Metrics: □ Spend  ☑ Leads  ☑ ROAS  □ Conv%  □ CAC          │
│                                                                │
│     40 ┤                              Google Ads ──────        │
│     30 ┤                    ╱╲        Local SEO ······        │
│     20 ┤        ╱──────────╱  ╲       Social Ads ─ ─ ─       │
│     10 ┤───────╱                ╲─────                        │
│      0 └─────────────────────────────────────────             │
│        Dec   Jan   Feb   Mar   Apr   May   Jun   Jul   Aug    │
└────────────────────────────────────────────────────────────────┘
```

### 4. Channel Deep Dive Analysis

#### Channel Comparison Table
```
┌──────────────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────┐
│ Channel      │ Spend │ Impr. │Visits │ Leads │Conv % │  CAC  │  ROAS   │
├──────────────┼───────┼───────┼───────┼───────┼───────┼───────┼─────────┤
│ Google Ads   │  $56K │  450K │ 12.5K │  641  │ 5.1%  │  $87  │  4.2    │
│ Local SEO    │  $25K │  180K │  5.2K │  222  │ 4.3%  │ $113  │  3.8    │
│ Social Ads   │  $31K │  380K │  8.1K │  185  │ 2.3%  │ $168  │  2.1    │
│ Organic SEO  │   $0  │  125K │  3.8K │  123  │ 3.2%  │   $0  │   ∞     │
│ Reactivation │  $13K │   45K │  2.1K │   63  │ 3.0%  │ $206  │  6.5    │
└──────────────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┘
```

#### Funnel Analysis by Channel
```
┌────────────────────────────────────────────────────────────────┐
│  Conversion Funnel by Channel                                  │
│  [Horizontal Funnel Charts - One per Channel]                  │
│                                                                │
│  Google Ads:   ████████████ → ██████ → ███ → █                │
│                Impressions    Visits   Leads  Appointments     │
│                   450K        12.5K    641     215            │
│                              (2.8%)   (5.1%)  (33.5%)         │
│                                                                │
│  Local SEO:    ████████ → █████ → ██ → █                      │
│                  180K      5.2K   222   89                    │
│                          (2.9%)  (4.3%) (40.1%)               │
└────────────────────────────────────────────────────────────────┘
```

### 5. Channel Performance Insights

#### Cost Efficiency Analysis
```
┌──────────────────────────────┬──────────────────────────────┐
│  Cost per Lead by Channel    │  Lead to Appointment Rate    │
│  [Bar Chart]                  │  [Bar Chart]                  │
│                              │                              │
│  Google Ads    ██ $87        │  Local SEO     ████ 40.1%   │
│  Local SEO     ███ $113      │  Google Ads    ███  33.5%    │
│  Social Ads    █████ $168    │  Organic SEO   ███  31.2%    │
│  Reactivation  ██████ $206   │  Reactivation  ██   28.3%    │
│  Organic SEO   ─ $0          │  Social Ads    ██   25.1%    │
└──────────────────────────────┴──────────────────────────────┘
```

#### Channel Quality Metrics
```
┌──────────────────────────────┬──────────────────────────────┐
│  Avg LTV by Channel Source   │  Online Booking % by Channel │
│  [Column Chart]               │  [Horizontal Bar Chart]       │
│                              │                              │
│   $4K ┤  ██                  │  Organic SEO   ████████ 45%  │
│   $3K ┤  ██  ██              │  Google Ads    ██████   38%   │
│   $2K ┤  ██  ██  ██          │  Local SEO     █████    32%   │
│   $1K ┤  ██  ██  ██  ██      │  Social Ads    ████     25%   │
│    $0 └──────────────        │  Reactivation  ███      18%   │
│        GA  LS  OS  SA        │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### 6. Channel Optimization Opportunities

```
┌────────────────────────────────────────────────────────────────┐
│  Optimization Recommendations                                  │
├────────────────────────────────────────────────────────────────┤
│  🟢 High Performers (Maintain/Scale)                          │
│  • Google Ads: ROAS 4.2, Consider 20% budget increase         │
│  • Local SEO: Best lead quality (40% appointment rate)        │
│                                                                │
│  🟡 Optimize Performance                                       │
│  • Social Ads: Low conversion (2.3%), test new audiences      │
│  • Reactivation: High CAC ($206), improve targeting           │
│                                                                │
│  🔴 Review Strategy                                            │
│  • Others: Minimal contribution, consider reallocation        │
└────────────────────────────────────────────────────────────────┘
```

## Key Metrics Definitions

### Primary Channel Metrics
1. **Channel Spend**: Total advertising spend per channel
2. **Channel ROAS**: Return on Ad Spend (LTV/Spend)
3. **Channel CAC**: Cost per Acquisition (Spend/Leads)
4. **Conversion Rate**: Leads/Visits percentage
5. **Lead Quality**: Appointment booking rate per channel

### Efficiency Indicators
1. **Cost per Visit**: Spend/Visits
2. **Cost per Lead**: Spend/Leads
3. **Cost per Appointment**: Spend/Appointments
4. **Impression to Lead**: End-to-end conversion
5. **Channel Contribution**: % of total leads/appointments

### Performance Ratios
1. **Share of Spend**: Channel spend / Total spend
2. **Share of Leads**: Channel leads / Total leads
3. **Efficiency Index**: (Share of Leads) / (Share of Spend)
4. **Quality Score**: (Appointment Rate × Avg LTV) / CAC

## Interactive Features

### 1. Channel Comparison Mode
- Select 2-3 channels for side-by-side comparison
- Highlight performance differences
- Show relative strengths/weaknesses

### 2. Time Period Analysis
- Month-over-Month changes
- Seasonal patterns identification
- Campaign period isolation

### 3. Drill-Down Capabilities
- Click any channel for detailed breakdown
- View daily performance within selected month
- Access campaign-level data (where available)

### 4. Performance Alerts
- Automatic flagging of anomalies
- Threshold-based notifications
- Opportunity identification

## Technical Implementation

### Company Access Patterns

#### Option 1: URL-Based Routing
```
/dashboard/advancedlifeclinic.com
/dashboard/alluraderm.com
/dashboard/bismarckbotox.com
... (one URL per clinic)
```

#### Option 2: Company Selector
```javascript
// Company selector in header
const companies = [
  'advancedlifeclinic.com',
  'alluraderm.com',
  'bismarckbotox.com',
  'drridha.com',
  'genesis-medspa.com',
  'greenspringaesthetics.com',
  'medicalagecenter.com',
  'parkhillclinic.com',
  'skincareinstitute.net',
  'skinjectables.com',
  'youthful-image.com'
];
```

### Key Queries

```sql
-- Channel Performance Summary (Company-Specific)
SELECT 
  traffic_source,
  SUM(spend) as total_spend,
  SUM(impressions) as total_impressions,
  SUM(visits) as total_visits,
  SUM(leads) as total_leads,
  AVG(total_roas) as avg_roas,
  AVG(total_conversion) as avg_conversion,
  SUM(spend) / NULLIF(SUM(leads), 0) as cac,
  SUM(total_appointments) as appointments,
  AVG(avg_ltv) as avg_ltv
FROM executive_monthly_reports
WHERE clinic = $1  -- Company parameter (e.g., 'advancedlifeclinic.com')
  AND month BETWEEN $2 AND $3
GROUP BY traffic_source
ORDER BY total_spend DESC;

-- Channel Trend Analysis (Company-Specific)
SELECT 
  DATE_TRUNC('month', month) as period,
  traffic_source,
  SUM(spend) as spend,
  SUM(leads) as leads,
  AVG(total_roas) as roas,
  AVG(total_conversion) as conversion_rate
FROM executive_monthly_reports
WHERE clinic = $1  -- Company parameter
GROUP BY period, traffic_source
ORDER BY period, traffic_source;

-- Channel Efficiency Score (Company-Specific)
WITH channel_metrics AS (
  SELECT 
    traffic_source,
    SUM(spend) as spend,
    SUM(leads) as leads,
    SUM(total_appointments) as appointments,
    AVG(avg_ltv) as avg_ltv,
    SUM(spend) / NULLIF(SUM(leads), 0) as cac
  FROM executive_monthly_reports
  WHERE clinic = $1 AND month BETWEEN $2 AND $3  -- Company + date filter
  GROUP BY traffic_source
)
SELECT 
  traffic_source,
  spend,
  leads,
  (leads::float / NULLIF(SUM(leads) OVER (), 0)) / 
  (spend::float / NULLIF(SUM(spend) OVER (), 0)) as efficiency_index,
  (appointments::float / NULLIF(leads, 0) * avg_ltv) / NULLIF(cac, 0) as quality_score
FROM channel_metrics
ORDER BY efficiency_index DESC;
```

## Visualization Specifications

### Color Scheme by Channel
- **Google Ads**: #4285F4 (Google Blue)
- **Local SEO**: #34A853 (Green)
- **Organic SEO**: #0F9D58 (Dark Green)
- **Social Ads**: #1877F2 (Facebook Blue)
- **Organic Social**: #E1306C (Instagram Pink)
- **Reactivation**: #9333EA (Purple)
- **Others**: #6B7280 (Gray)
- **Test**: #F59E0B (Amber)

### Chart Types
1. **Donut Charts**: Channel mix visualization
2. **Bubble Charts**: Multi-dimensional comparison
3. **Line Charts**: Trend analysis
4. **Bar Charts**: Direct comparisons
5. **Funnel Charts**: Conversion pathway
6. **Heat Maps**: Performance matrix

## Mobile Optimization

### Responsive Breakpoints
- **Desktop**: Full dashboard with all sections
- **Tablet**: 2-column layout, scrollable charts
- **Mobile**: Single column, expandable sections

### Mobile-Specific Features
- Swipeable channel cards
- Tap to expand detailed metrics
- Simplified table views
- Touch-optimized interactions

## Implementation Roadmap

### Week 1: Core Channel Analytics
- [ ] Channel performance summary cards
- [ ] Channel mix visualizations
- [ ] Basic comparison table
- [ ] Monthly trend charts

### Week 2: Advanced Analysis
- [ ] Conversion funnel by channel
- [ ] Efficiency scoring system
- [ ] Cost analysis breakdowns
- [ ] Quality metrics integration

### Week 3: Optimization Features
- [ ] Recommendation engine
- [ ] Anomaly detection
- [ ] Performance alerts
- [ ] Comparative analysis tools

### Week 4: Polish & Enhancement
- [ ] Mobile responsiveness
- [ ] Export functionality
- [ ] Custom date ranges
- [ ] API integration

## Success Metrics

### Dashboard KPIs
- **Load Time**: < 2 seconds
- **Data Accuracy**: 99.9% match with source
- **Update Frequency**: Real-time or < 5 min delay

### Business Impact
- **Channel Optimization**: 15% improvement in overall ROAS
- **Budget Efficiency**: 20% reduction in wasted spend
- **Lead Quality**: 10% increase in appointment rate
- **Decision Speed**: 50% faster channel adjustments

## Dashboard Mockup

```
╔══════════════════════════════════════════════════════════════════╗
║     📊 MARKETING PERFORMANCE - ADVANCED LIFE CLINIC              ║
║     [📅 Jan-Aug 2025 ▼]  [📈 Monthly View]  [⬇ Export]         ║
╠══════════════════════════════════════════════════════════════════╣
║   💰 $125K      📊 1,234      📈 3.45       🎯 12.5%    💵 $245 ║
║   Total Spend    Total Leads   Avg ROAS     Conv Rate    Avg CAC║
╠══════════════════════════════════════════════════════════════════╣
║  ┌─ Channel Mix (Spend) ───┐  ┌─ Performance Matrix ──────────┐ ║
║  │      Google Ads         │  │  ROAS                         │ ║
║  │         45%              │  │   6│      ◯ Reactivation     │ ║
║  │    ╱─────────╲          │  │   4│  ● Google                │ ║
║  │   │           │         │  │   2│○ Social   ◉ Local        │ ║
║  │   │    ███    │ Social  │  │   0└──────────────────────    │ ║
║  │   │   █████   │  25%    │  │    0   20K   40K   60K Spend │ ║
║  │    ╲─────────╱          │  └──────────────────────────────┘ ║
║  │      Local SEO          │  ┌─ Channel Trends ─────────────┐ ║
║  │         20%              │  │ ──── Google  ···· Local     │ ║
║  └─────────────────────────┘  │ ─ ─ Social                  │ ║
║                                │    ╱╲                        │ ║
║  ┌─ Top Performing Channels ───────────────────────────────┐   ║
║  │ Channel      Spend   Leads   ROAS   Conv%    CAC       │   ║
║  │ Google Ads   $56K    641     4.2    5.1%     $87       │   ║
║  │ Local SEO    $25K    222     3.8    4.3%     $113      │   ║
║  │ Social Ads   $31K    185     2.1    2.3%     $168      │   ║
║  └─────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════╝
```