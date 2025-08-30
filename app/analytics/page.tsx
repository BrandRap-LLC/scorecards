'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartContainer } from '@/components/ChartContainer';
import { FilterPanel } from '@/components/FilterPanel';
import { MetricCard } from '@/components/MetricCard';
import { FilterState } from '@/types/dashboard';
import { 
  getExecutiveMonthlyReports,
  getExecutiveCompanies,
  getExecutiveTrafficSources,
  getExecutiveDateRange 
} from '@/lib/api-executive';
import { ExecutiveMonthlyReport } from '@/types/executive';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, MousePointer, Target } from 'lucide-react';

interface AnalyticsData {
  period: string;
  revenue: number;
  leads: number;
  appointments: number;
  spend: number;
  visits: number;
  roas: number;
  conversion_rate: number;
  cost_per_lead: number;
}

export default function AnalyticsPage() {
  const [reportData, setReportData] = useState<ExecutiveMonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    companies: [],
    startDate: '2024-01-01',
    endDate: new Date().toISOString().slice(0, 10),
    trafficSources: [],
    period: 'monthly'
  });
  
  const [filterOptions, setFilterOptions] = useState({
    companies: [] as string[],
    trafficSources: [] as string[],
    dateRange: { min: '2024-01-01', max: new Date().toISOString().slice(0, 10) }
  });

  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  // Load data
  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const [companies, trafficSources, dateRange] = await Promise.all([
        getExecutiveCompanies(),
        getExecutiveTrafficSources(),
        getExecutiveDateRange()
      ]);
      
      setFilterOptions({
        companies,
        trafficSources,
        dateRange
      });
      
      setFilters(prev => ({
        ...prev,
        companies,
        trafficSources,
        startDate: dateRange.min,
        endDate: dateRange.max
      }));
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterConfig = {
        companies: filters.companies.length > 0 ? filters.companies : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        trafficSources: filters.trafficSources.length > 0 ? filters.trafficSources : undefined
      };

      const data = await getExecutiveMonthlyReports(filterConfig);
      setReportData(data);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process data for time series analysis
  const processAnalyticsData = (): AnalyticsData[] => {
    const monthlyTotals = new Map<string, AnalyticsData>();

    reportData.forEach(report => {
      const month = report.month;
      
      if (!monthlyTotals.has(month)) {
        monthlyTotals.set(month, {
          period: month,
          revenue: 0,
          leads: 0,
          appointments: 0,
          spend: 0,
          visits: 0,
          roas: 0,
          conversion_rate: 0,
          cost_per_lead: 0
        });
      }

      const data = monthlyTotals.get(month)!;
      data.revenue += report.total_estimated_revenue || 0;
      data.leads += report.leads || 0;
      data.appointments += report.total_appointments || 0;
      data.spend += report.spend || 0;
      data.visits += report.visits || 0;
    });

    // Calculate derived metrics
    return Array.from(monthlyTotals.values()).map(data => ({
      ...data,
      roas: data.spend > 0 ? data.revenue / data.spend : 0,
      conversion_rate: data.visits > 0 ? data.leads / data.visits : 0,
      cost_per_lead: data.leads > 0 ? data.spend / data.leads : 0
    })).sort((a, b) => a.period.localeCompare(b.period));
  };

  const analyticsData = processAnalyticsData();

  // Calculate summary metrics
  const summaryMetrics = analyticsData.reduce((acc, data) => ({
    totalRevenue: acc.totalRevenue + data.revenue,
    totalLeads: acc.totalLeads + data.leads,
    totalSpend: acc.totalSpend + data.spend,
    totalVisits: acc.totalVisits + data.visits
  }), { totalRevenue: 0, totalLeads: 0, totalSpend: 0, totalVisits: 0 });

  const averageROAS = summaryMetrics.totalSpend > 0 ? summaryMetrics.totalRevenue / summaryMetrics.totalSpend : 0;
  const averageConversion = summaryMetrics.totalVisits > 0 ? summaryMetrics.totalLeads / summaryMetrics.totalVisits : 0;

  // Calculate month-over-month growth
  const calculateGrowth = (data: AnalyticsData[], key: keyof AnalyticsData): number => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1][key] as number;
    const previous = data[data.length - 2][key] as number;
    return previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  const metricOptions = [
    { key: 'revenue', label: 'Revenue', color: '#2563eb', format: 'currency' },
    { key: 'leads', label: 'Leads', color: '#16a34a', format: 'number' },
    { key: 'appointments', label: 'Appointments', color: '#dc2626', format: 'number' },
    { key: 'spend', label: 'Ad Spend', color: '#9333ea', format: 'currency' },
    { key: 'roas', label: 'ROAS', color: '#ea580c', format: 'number' },
    { key: 'conversion_rate', label: 'Conversion Rate', color: '#0891b2', format: 'percent' }
  ];

  if (error) {
    return (
      <DashboardLayout title="Analytics & Trends" subtitle="Time series analysis of marketing performance">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Analytics & Trends" 
      subtitle="Time series analysis of marketing performance"
    >
      <div className="space-y-8">
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Performance Trends
            </h2>
            <p className="text-gray-600">
              Analyze performance trends across {filters.companies.length || filterOptions.companies.length} companies
            </p>
          </div>
          <div className="flex items-center gap-4">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              availableCompanies={filterOptions.companies}
              availableTrafficSources={filterOptions.trafficSources}
              dateRange={filterOptions.dateRange}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={summaryMetrics.totalRevenue}
            formatType="currency"
            change={calculateGrowth(analyticsData, 'revenue')}
            trend={calculateGrowth(analyticsData, 'revenue') > 0 ? 'up' : 'down'}
            subtitle="Month-over-month"
            isLoading={loading}
          />
          <MetricCard
            title="Total Leads"
            value={summaryMetrics.totalLeads}
            formatType="number"
            change={calculateGrowth(analyticsData, 'leads')}
            trend={calculateGrowth(analyticsData, 'leads') > 0 ? 'up' : 'down'}
            subtitle="Month-over-month"
            isLoading={loading}
          />
          <MetricCard
            title="Average ROAS"
            value={averageROAS}
            formatType="number"
            change={calculateGrowth(analyticsData, 'roas')}
            trend={calculateGrowth(analyticsData, 'roas') > 0 ? 'up' : 'down'}
            subtitle="Return on ad spend"
            isLoading={loading}
          />
          <MetricCard
            title="Conversion Rate"
            value={averageConversion}
            formatType="percent"
            change={calculateGrowth(analyticsData, 'conversion_rate')}
            trend={calculateGrowth(analyticsData, 'conversion_rate') > 0 ? 'up' : 'down'}
            subtitle="Visits to leads"
            isLoading={loading}
          />
        </div>

        {/* Main Trend Chart */}
        <ChartContainer
          title="Performance Trends Over Time"
          subtitle="Select a metric to analyze its trend"
          loading={loading}
          height={400}
          actions={
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {metricOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const option = metricOptions.find(opt => opt.key === selectedMetric);
                  if (option?.format === 'currency') {
                    return [`$${(value as number).toLocaleString()}`, option.label];
                  } else if (option?.format === 'percent') {
                    return [`${((value as number) * 100).toFixed(2)}%`, option.label];
                  }
                  return [value, option?.label];
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={metricOptions.find(opt => opt.key === selectedMetric)?.color || '#2563eb'}
                fill={metricOptions.find(opt => opt.key === selectedMetric)?.color || '#2563eb'}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Multi-Metric Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Spend */}
          <ChartContainer
            title="Revenue vs Ad Spend"
            subtitle="Investment and returns comparison"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spend" fill="#dc2626" name="Ad Spend" />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} name="Revenue" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Conversion Funnel */}
          <ChartContainer
            title="Conversion Funnel"
            subtitle="Visits to leads to appointments"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  stackId="1"
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  name="Visits"
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stackId="2"
                  stroke="#16a34a" 
                  fill="#16a34a" 
                  name="Leads"
                />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  stackId="3"
                  stroke="#dc2626" 
                  fill="#dc2626" 
                  name="Appointments"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartContainer
            title="ROAS Trend"
            subtitle="Return on ad spend over time"
            loading={loading}
            height={250}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}x`, 'ROAS']} />
                <Line type="monotone" dataKey="roas" stroke="#ea580c" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Cost per Lead"
            subtitle="Lead acquisition cost trend"
            loading={loading}
            height={250}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Cost per Lead']} />
                <Area 
                  type="monotone" 
                  dataKey="cost_per_lead" 
                  stroke="#9333ea" 
                  fill="#9333ea"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Conversion Rate"
            subtitle="Visits to leads conversion"
            loading={loading}
            height={250}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${((value as number) * 100).toFixed(2)}%`, 'Conversion Rate']} />
                <Bar dataKey="conversion_rate" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}