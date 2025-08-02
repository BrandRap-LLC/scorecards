# Executive Dashboard Platform

A comprehensive analytics dashboard for tracking clinic performance metrics across multiple companies, powered by monthly executive reports data.

## Features

- **Company Overview Dashboards**: Comprehensive performance metrics for each clinic
- **Traffic Source Analysis**: Detailed breakdown by marketing channel
- **Marketing Funnel Visualization**: Track conversion through each stage
- **Cost Efficiency Metrics**: ROI, ROAS, CAC analysis
- **Customer Journey Analytics**: New vs returning patient insights
- **Interactive Charts**: Dynamic visualizations with drill-down capabilities
- **Mobile Responsive**: Fully responsive design optimized for all devices

## Data Architecture

### Primary Data Source
**Table**: `executive_monthly_reports` (Supabase)
- **Records**: 572 (December 2024 data)
- **Companies**: 11 clinics
- **Traffic Sources**: 8 marketing channels
- **Metrics**: 21 performance indicators

### Key Metrics Available
- **Marketing**: impressions, visits, spend
- **Lead Generation**: leads, conversion_rate
- **Customer Acquisition**: cac_total, cac_new
- **Appointments**: total_appointments, new_appointments, returning_appointments, online_booking
- **Engagement**: total_conversations, new_conversations, returning_conversations  
- **Revenue**: ltv, estimated_ltv_6m, avg_ltv, roas

### Data Dimensions
- **Clinic**: Individual clinic/company identifier
- **Month**: Report period (currently December 2024)
- **Traffic Source**: Marketing channel (google ads, local seo, organic, social, etc.)

## Planned Pages

### Company Dashboard (`/dashboard/[company]`)
- Comprehensive overview for each clinic
- KPI summary cards
- Traffic source performance table
- Marketing funnel visualization
- Cost analysis charts
- Customer journey metrics

### Comparison View (`/compare`)
- Multi-company performance comparison
- Benchmarking against averages
- Best/worst performer identification

### Analytics (`/analytics`)
- Deep dive into specific metrics
- Custom date range selection (when more data available)
- Advanced filtering and segmentation

## Dashboard Components (Planned)

### Summary Cards
- Total Spend
- Total Leads
- Total Appointments
- Overall Conversion Rate
- Average ROAS

### Visualizations
- Traffic Source Performance Grid
- Marketing Funnel Chart
- Spend Distribution Pie Chart
- Cost Efficiency Scatter Plot
- New vs Returning Stacked Bars
- LTV Analysis Charts

### Analytics Features
- Sortable/filterable tables
- Interactive tooltips
- Drill-down capabilities
- Export to CSV/PDF

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MSSQL Configuration (for data sync)
MSSQL_SERVER=server_address
MSSQL_PORT=1433
MSSQL_DATABASE=database_name
MSSQL_USERNAME=username
MSSQL_PASSWORD=password
```

## Data Migration & Sync

### Weekly Data Sync
```bash
npm run sync                 # Sync weekly data from MSSQL to Supabase
```

### Monthly Data Migration
```bash
npm run sync:monthly         # Migrate monthly executive reports
node scripts/check-tables.js # Check table status in Supabase
```

## Deployment

The project is configured for deployment to Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

## Key Differences from CEO Report

1. **Weekly vs Monthly**: All metrics are tracked by week instead of month
2. **12-Week View**: Grid shows 12 weeks instead of 6 months
3. **MTD Handling**: Special handling for incomplete week data
4. **Simplified Navigation**: Focused on core scorecard functionality
5. **WoW Analysis**: Week-over-week instead of month-over-month

## Technologies

- Next.js 15.4.5
- TypeScript
- Tailwind CSS
- Supabase
- Chart.js
- Lucide Icons

## Mobile Features

- Hamburger menu navigation
- Responsive grid layouts
- Touch-friendly interfaces
- Optimized table scrolling
- Abbreviated labels for small screens