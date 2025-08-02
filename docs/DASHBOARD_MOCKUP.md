# Dashboard Visual Mockup & Component Layout

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Company Selector Dropdown]              [Export] [Date: Dec 2024]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │  $15.2K  │ │   487    │ │   412    │ │  84.5%   │ │   3.2x   │
│  │  Spend   │ │  Leads   │ │Appointments│ │Conv Rate │ │   ROAS   │
│  │   ▲12%   │ │   ▼5%    │ │    ▲8%    │ │   ▲2.1%  │ │   ▲0.5x  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Marketing Funnel                    │  Spend Distribution        │
│  ┌─────────────────────────────┐    │  ┌──────────────────────┐  │
│  │ Impressions  45,230  (100%) │    │  │    🟦 Google Ads 45% │  │
│  │ ↓                           │    │  │    🟧 Local SEO  30% │  │
│  │ Visits       8,456   (19%)  │    │  │    🟨 Social     15% │  │
│  │ ↓                           │    │  │    🟩 Organic    10% │  │
│  │ Leads         487    (5.8%) │    │  └──────────────────────┘  │
│  │ ↓                           │    │                             │
│  │ Appointments  412    (85%)  │    │  Top Performers            │
│  └─────────────────────────────┘    │  1. Local SEO - 245 leads  │
│                                      │  2. Google Ads - 142 leads │
├─────────────────────────────────────┴─────────────────────────────┤
│                                                                   │
│  Traffic Source Performance                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Source      | Spend  | Visits | Leads | Conv% | CAC  | ROAS│  │
│  │─────────────┼────────┼────────┼───────┼───────┼──────┼─────│  │
│  │ Google Ads  | $6,840 | 3,802  |  142  | 73.2% | $48  | 2.8x│  │
│  │ Local SEO   | $4,560 | 2,534  |  245  | 92.1% | $19  | 5.2x│  │
│  │ Social Ads  | $2,280 |   892  |   67  | 65.7% | $34  | 1.9x│  │
│  │ Organic SEO | $1,520 | 1,228  |   33  | 81.8% | $46  | 3.1x│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Customer Journey          │  Acquisition Costs                  │
│  ┌────────────────────┐   │  ┌─────────────────────────────┐   │
│  │ New vs Returning   │   │  │ CAC Comparison              │   │
│  │ ██████░░░░ 65% New │   │  │ Total CAC: $31.20          │   │
│  │            35% Ret │   │  │ New CAC:   $42.50          │   │
│  │                    │   │  │ ────────────────           │   │
│  │ Appointments: 412  │   │  │ Cost/Lead:  $31.20         │   │
│  │ Conversations: 523 │   │  │ Cost/Appt:  $36.89         │   │
│  └────────────────────┘   │  └─────────────────────────────┘   │
│                            │                                     │
│  Online Booking Rate       │  LTV Analysis                      │
│  ┌────────────────────┐   │  ┌─────────────────────────────┐   │
│  │  ████████░░ 78%    │   │  │ Current LTV:    $487       │   │
│  │  321 of 412        │   │  │ 6-Month Est:    $892       │   │
│  │  appointments      │   │  │ Average LTV:    $652       │   │
│  └────────────────────┘   │  └─────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Header Section
```jsx
<DashboardHeader>
  <CompanySelector 
    companies={['advancedlifeclinic.com', 'alluraderm.com', ...]}
    selected={currentCompany}
    onChange={setCurrentCompany}
  />
  <ActionButtons>
    <ExportButton formats={['CSV', 'PDF']} />
    <DateDisplay date="December 2024" />
  </ActionButtons>
</DashboardHeader>
```

### 2. KPI Cards Row
```jsx
<KPICardsGrid>
  <KPICard
    title="Total Spend"
    value={15234}
    format="currency"
    change={12}
    trend="up"
    icon={<DollarSign />}
  />
  <KPICard
    title="Leads Generated"
    value={487}
    format="number"
    change={-5}
    trend="down"
    icon={<Users />}
  />
  // ... more cards
</KPICardsGrid>
```

### 3. Marketing Funnel
```jsx
<FunnelChart
  stages={[
    { name: 'Impressions', value: 45230, percent: 100 },
    { name: 'Visits', value: 8456, percent: 18.7 },
    { name: 'Leads', value: 487, percent: 5.8 },
    { name: 'Appointments', value: 412, percent: 84.5 }
  ]}
  showDropoff={true}
  interactive={true}
/>
```

### 4. Spend Distribution
```jsx
<PieChart
  data={[
    { name: 'Google Ads', value: 6840, color: '#3B82F6' },
    { name: 'Local SEO', value: 4560, color: '#FB923C' },
    { name: 'Social Ads', value: 2280, color: '#FDE047' },
    { name: 'Organic SEO', value: 1520, color: '#84CC16' }
  ]}
  showLegend={true}
  showTooltip={true}
  innerRadius={60}  // Donut chart
/>
```

### 5. Traffic Source Table
```jsx
<TrafficSourceTable
  columns={[
    { key: 'source', label: 'Traffic Source', sortable: true },
    { key: 'spend', label: 'Spend', format: 'currency', sortable: true },
    { key: 'visits', label: 'Visits', format: 'number', sortable: true },
    { key: 'leads', label: 'Leads', format: 'number', sortable: true },
    { key: 'convRate', label: 'Conv %', format: 'percent', sortable: true },
    { key: 'cac', label: 'CAC', format: 'currency', sortable: true },
    { key: 'roas', label: 'ROAS', format: 'multiplier', sortable: true }
  ]}
  data={trafficSourceData}
  defaultSort="spend"
  highlightBest={true}
  expandable={true}
/>
```

### 6. Customer Journey Cards
```jsx
<CustomerMetrics>
  <SplitBar
    title="New vs Returning"
    segments={[
      { label: 'New', value: 268, color: '#3B82F6' },
      { label: 'Returning', value: 144, color: '#94A3B8' }
    ]}
    showPercentage={true}
  />
  <MetricCard
    title="Online Booking Rate"
    value={78}
    format="percent"
    subtitle="321 of 412 appointments"
    icon={<Calendar />}
  />
</CustomerMetrics>
```

## Color Scheme

### Primary Palette
- **Primary Blue**: #3B82F6 (Main actions, primary metrics)
- **Success Green**: #10B981 (Positive changes, good performance)
- **Warning Orange**: #F59E0B (Attention needed)
- **Danger Red**: #EF4444 (Negative changes, poor performance)
- **Neutral Gray**: #6B7280 (Secondary text, borders)

### Traffic Source Colors
- Google Ads: #3B82F6 (Blue)
- Local SEO: #FB923C (Orange)
- Social Ads: #FDE047 (Yellow)
- Organic SEO: #84CC16 (Green)
- Others: #8B5CF6 (Purple)
- Reactivation: #EC4899 (Pink)

### Background Colors
- Page Background: #F9FAFB
- Card Background: #FFFFFF
- Hover State: #F3F4F6
- Active State: #E5E7EB

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 
             'Helvetica Neue', sans-serif;
```

### Size Scale
- **Page Title**: 32px/2rem (font-bold)
- **Section Headers**: 24px/1.5rem (font-semibold)
- **Card Titles**: 14px/0.875rem (font-medium, uppercase)
- **Metric Values**: 36px/2.25rem (font-bold)
- **Body Text**: 14px/0.875rem (font-normal)
- **Small Text**: 12px/0.75rem (font-normal)

## Responsive Breakpoints

### Desktop (1280px+)
- Full layout as shown
- 5 KPI cards in a row
- Side-by-side charts

### Tablet (768px - 1279px)
- 3 KPI cards per row
- Stacked charts
- Scrollable table

### Mobile (< 768px)
- 2 KPI cards per row
- Single column layout
- Collapsible sections
- Horizontal scroll for table
- Simplified funnel chart

## Interactive States

### Hover Effects
- Cards: Slight shadow elevation
- Table rows: Background color change
- Charts: Highlight segment/data point
- Buttons: Darken background

### Click Actions
- Company selector: Dropdown menu
- Table headers: Sort ascending/descending
- Chart segments: Filter other components
- Export button: Format selection menu

### Loading States
- Skeleton screens for cards
- Shimmer effect for charts
- Progress bar for data fetch

## Animation Guidelines

### Transitions
- Duration: 200-300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Properties: opacity, transform, background-color

### Chart Animations
- Initial load: Fade in with scale
- Data update: Smooth morphing
- Hover: Immediate highlight

### Number Animations
- Count up from 0 on initial load
- Smooth transition on data change
- Duration based on value magnitude