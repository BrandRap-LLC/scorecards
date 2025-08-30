'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { ChartContainer } from '@/components/ChartContainer';
import { FilterPanel } from '@/components/FilterPanel';
import { FilterState, TableColumn } from '@/types/dashboard';
import { 
  getMetricSummaries, 
  getCompanyMetricCards, 
  getExecutiveCompanies,
  getExecutiveTrafficSources,
  getExecutiveDateRange 
} from '@/lib/api-executive';
import { MetricSummary, CompanyMetricCard } from '@/types/executive';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const [metricSummaries, setMetricSummaries] = useState<MetricSummary[]>([]);
  const [companyCards, setCompanyCards] = useState<CompanyMetricCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
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

  // Load initial data and filter options
  useEffect(() => {
    loadDashboardData();
    loadFilterOptions();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadDashboardData();
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
      
      // Initialize filters with all companies and sources
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterConfig = {
        companies: filters.companies.length > 0 ? filters.companies : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        trafficSources: filters.trafficSources.length > 0 ? filters.trafficSources : undefined
      };

      const [summaries, cards] = await Promise.all([
        getMetricSummaries(filters.period, filterConfig),
        getCompanyMetricCards(filters.period)
      ]);

      setMetricSummaries(summaries);
      setCompanyCards(cards);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Key metrics for hero cards
  const keyMetrics = metricSummaries.slice(0, 4);

  // Table columns for company overview
  const companyColumns: TableColumn<CompanyMetricCard>[] = [
    {
      key: 'display_name',
      title: 'Company',
      sortable: true,
      width: '200px'
    },
    {
      key: 'monthly_revenue',
      title: 'Revenue',
      formatType: 'currency',
      sortable: true,
      align: 'right'
    },
    {
      key: 'monthly_leads',
      title: 'Leads',
      formatType: 'number',
      sortable: true,
      align: 'right'
    },
    {
      key: 'monthly_appointments',
      title: 'Appointments',
      formatType: 'number',
      sortable: true,
      align: 'right'
    },
    {
      key: 'cost_per_lead',
      title: 'Cost per Lead',
      formatType: 'currency',
      sortable: true,
      align: 'right'
    },
    {
      key: 'roas',
      title: 'ROAS',
      render: (value) => value ? `${value.toFixed(2)}x` : 'N/A',
      sortable: true,
      align: 'right'
    }
  ];

  if (error) {
    return (
      <DashboardLayout title="Executive Dashboard" subtitle="Marketing performance overview">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
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
      title="Executive Dashboard" 
      subtitle="Marketing performance overview across all companies"
    >
      <div className="space-y-8">
        {/* Filters */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Performance Overview
            </h2>
            <p className="text-gray-600">
              {filters.period === 'monthly' ? 'Monthly' : 'Weekly'} metrics across {filters.companies.length || filterOptions.companies.length} companies
            </p>
          </div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            availableCompanies={filterOptions.companies}
            availableTrafficSources={filterOptions.trafficSources}
            dateRange={filterOptions.dateRange}
          />
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric) => (
            <MetricCard
              key={metric.metric_key}
              title={metric.metric_name}
              value={metric.total_value}
              formatType={metric.format_type}
              change={metric.period_change_percent}
              changeType="percent"
              trend={metric.trend}
              subtitle={`Across ${metric.company_values.length} companies`}
              isLoading={loading}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <ChartContainer
            title="Revenue Trend"
            subtitle="Total estimated revenue over time"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Top Companies by Revenue */}
          <ChartContainer
            title="Top Companies"
            subtitle="Revenue by company this period"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={companyCards.slice(0, 8).map(card => ({
                  name: card.display_name,
                  revenue: card.monthly_revenue || 0
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Detailed Company Performance Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Company Performance Details
          </h3>
          <DataTable
            data={companyCards}
            columns={companyColumns}
            loading={loading}
            searchable={true}
            sortable={true}
            exportable={true}
            pagination={true}
            pageSize={20}
            emptyMessage="No company data available for the selected filters"
          />
        </div>

        {/* All Metrics Summary */}
        {metricSummaries.length > 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              All Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {metricSummaries.slice(4).map((metric) => (
                <MetricCard
                  key={metric.metric_key}
                  title={metric.metric_name}
                  value={metric.avg_value}
                  formatType={metric.format_type}
                  change={metric.period_change_percent}
                  changeType="percent"
                  trend={metric.trend}
                  size="small"
                  isLoading={loading}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}