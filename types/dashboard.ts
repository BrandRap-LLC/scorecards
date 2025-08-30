import { ExecutiveMonthlyReport, ExecutiveWeeklyReport, MetricSummary } from './executive';

// Dashboard component prop types
export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

export interface FilterState {
  companies: string[];
  startDate: string;
  endDate: string;
  trafficSources: string[];
  period: 'monthly' | 'weekly';
}

export interface MetricCardProps {
  title: string;
  value: number | null;
  formatType: 'currency' | 'number' | 'percent';
  change?: number;
  changeType?: 'percent' | 'absolute';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  showSparkline?: boolean;
  sparklineData?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  formatType?: 'currency' | 'number' | 'percent' | 'date' | 'text';
  className?: string;
}

export interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableCompanies: string[];
  availableTrafficSources: string[];
  dateRange: {
    min: string;
    max: string;
  };
  className?: string;
}

export interface TrendIndicatorProps {
  value: number;
  threshold?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
}

// Chart-specific props
export interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  curveType?: 'linear' | 'monotone' | 'step';
  formatTooltip?: (value: any, name: string, props: any) => any;
}

export interface TimeSeriesDataPoint {
  period: string;
  [key: string]: number | string | null;
}

export interface BarChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  stacked?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  formatTooltip?: (value: any, name: string, props: any) => any;
}

export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  formatTooltip?: (value: any, name: string, props: any) => any;
}

// Navigation types
export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

// Data export types
export interface ExportConfig {
  filename: string;
  format: 'csv' | 'excel' | 'json';
  includeHeaders: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: FilterState;
}

// Dashboard page types
export interface DashboardPageProps {
  searchParams: Promise<{
    companies?: string;
    period?: 'monthly' | 'weekly';
    startDate?: string;
    endDate?: string;
    trafficSources?: string;
  }>;
}

export interface CompanyPageProps {
  params: Promise<{
    company: string;
  }>;
  searchParams: Promise<{
    period?: 'monthly' | 'weekly';
    startDate?: string;
    endDate?: string;
    trafficSources?: string;
  }>;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface AsyncData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}