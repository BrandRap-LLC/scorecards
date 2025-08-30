// Chart data structure types for Recharts integration

export interface ChartDataPoint {
  period: string;
  [key: string]: number | string | null | undefined;
}

export interface MetricTrendData extends ChartDataPoint {
  clinic: string;
  traffic_source: string;
  value: number | null;
  change_percent?: number | null;
}

export interface ComparisonChartData {
  metric_name: string;
  companies: {
    clinic: string;
    current_value: number | null;
    previous_value: number | null;
    change_percent: number | null;
  }[];
}

export interface TrafficSourceChartData extends ChartDataPoint {
  traffic_source: string;
  impressions: number | null;
  visits: number | null;
  spend: number | null;
  leads: number | null;
  appointments: number | null;
  revenue: number | null;
}

export interface ConversionFunnelData {
  stage: string;
  value: number;
  previous_value?: number;
  conversion_rate?: number;
  drop_off_rate?: number;
}

export interface HeatmapData {
  clinic: string;
  metric: string;
  value: number | null;
  normalized_value: number; // 0-1 for color intensity
  period: string;
}

// Chart configuration types
export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  neutral: string;
  gradient?: {
    start: string;
    end: string;
  };
}

export interface ChartTheme {
  colors: ChartColors;
  fonts: {
    family: string;
    size: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    margin: number;
    padding: number;
  };
}

// Specific chart component props
export interface LineChartConfig {
  type: 'line';
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean | object;
  activeDot?: boolean | object;
}

export interface AreaChartConfig {
  type: 'area';
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
}

export interface BarChartConfig {
  type: 'bar';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
}

export type ChartConfig = LineChartConfig | AreaChartConfig | BarChartConfig;

// Performance metrics for charts
export interface ROASChartData extends ChartDataPoint {
  total_roas: number | null;
  new_roas: number | null;
  target_roas?: number;
}

export interface CACChartData extends ChartDataPoint {
  cac_total: number | null;
  cac_new: number | null;
  target_cac?: number;
  industry_benchmark?: number;
}

export interface ConversionRateData extends ChartDataPoint {
  total_conversion: number | null;
  new_conversion: number | null;
  returning_conversion: number | null;
  traffic_source: string;
}

export interface RevenueBreakdownData {
  clinic: string;
  total_revenue: number;
  traffic_sources: {
    source: string;
    revenue: number;
    percentage: number;
  }[];
}

// Advanced visualization types
export interface BubbleChartData {
  clinic: string;
  x: number; // e.g., spend
  y: number; // e.g., revenue
  size: number; // e.g., leads
  color?: string;
  label?: string;
}

export interface CohortData {
  period: string;
  cohort_month: string;
  customers: number;
  revenue: number;
  retention_rate: number;
}

export interface GeographicData {
  region: string;
  lat: number;
  lng: number;
  value: number;
  clinic_count: number;
  total_revenue: number;
}

// Chart interaction types
export interface ChartTooltipData {
  label: string;
  payload: {
    dataKey: string;
    value: number | null;
    color?: string;
    name?: string;
    unit?: string;
    formatted?: string;
  }[];
}

export interface ChartLegendData {
  value: string;
  type?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
  color?: string;
  inactive?: boolean;
}

// Export types for chart data
export interface ChartExportData {
  chart_type: string;
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    type: 'number' | 'string' | 'currency' | 'percent' | 'date';
  }[];
  metadata: {
    generated_at: string;
    filters: any;
    period: string;
  };
}