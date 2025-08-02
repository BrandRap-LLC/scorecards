# Weekly Scorecards Dashboard

A weekly performance metrics dashboard for tracking clinic operations across multiple companies.

## Features

- **Weekly Metrics Display**: View current week's performance metrics for all companies
- **12-Week Grid View**: Historical data view showing the last 12 weeks of metrics
- **MTD Indicators**: Clear marking of month-to-date (incomplete) week data
- **Week-over-Week Analysis**: Automatic WoW percentage calculations and trend indicators
- **Company Filtering**: Filter views by individual companies
- **CSV Export**: Export data from both homepage and grid views
- **Mobile Responsive**: Fully responsive design with hamburger menu for mobile

## Data Architecture

### MSSQL Source
- Table: `executive_report_new_week`
- Contains weekly metrics for all companies
- Excludes conversation-related columns

### Supabase Tables
- `companies`: Company definitions
- `scorecards_metrics`: Metric definitions and categories
- `scorecards_weekly`: Weekly metric values with WoW calculations
- `latest_scorecards`: View for current week data
- `scorecards_12week_history`: View for 12-week historical data

## Pages

### Homepage (`/`)
- Displays current week's metrics grouped by company and category
- Shows WoW change indicators
- MTD badge for incomplete weeks
- Company filter tabs
- CSV export functionality

### Grid View (`/grid`)
- 12-week historical view for all companies
- Expandable company sections
- Week headers (W1-W52)
- MTD indicators with warning icons
- Color-coded current week column

### Data Quality (`/data-quality`)
- Monitor data sync status
- View data completeness metrics
- Check sync history

## Metric Categories

- **Revenue**: Net Sales, Gross Sales, Service Revenue, Product Revenue
- **Customer**: New Customers, Returning Customers, Retention Rate
- **Operations**: Appointments, Show Rate, Utilization, Average Ticket
- **Marketing**: Leads, Conversion Rate, Cost per Lead, ROI

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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
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