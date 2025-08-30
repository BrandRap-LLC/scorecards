'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { ChartContainer } from '@/components/ChartContainer';
import { FilterPanel } from '@/components/FilterPanel';
import { FilterState, TableColumn } from '@/types/dashboard';
import { fetchPaidAdsData, fetchUniqueClinics, fetchDateRange } from '@/lib/api-paid-seo';
import { PaidAdsRecord } from '@/lib/api-paid-seo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';

export default function CampaignsPage() {
  const [paidAdsData, setPaidAdsData] = useState<PaidAdsRecord[]>([]);
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

  // Load data
  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadCampaignData();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const [companies, dateRange] = await Promise.all([
        fetchUniqueClinics(),
        fetchDateRange()
      ]);
      
      const trafficSources = ['Google Ads', 'Facebook Ads', 'Microsoft Ads', 'LinkedIn Ads']; // Common paid sources
      
      setFilterOptions({
        companies,
        trafficSources,
        dateRange: {
          min: dateRange.minDate.toISOString().slice(0, 10),
          max: dateRange.maxDate.toISOString().slice(0, 10)
        }
      });
      
      setFilters(prev => ({
        ...prev,
        companies,
        trafficSources,
        startDate: dateRange.minDate.toISOString().slice(0, 10),
        endDate: dateRange.maxDate.toISOString().slice(0, 10)
      }));
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchPaidAdsData(
        filters.companies.length === filterOptions.companies.length ? undefined : filters.companies[0],
        filters.startDate,
        filters.endDate
      );

      setPaidAdsData(data);
    } catch (err) {
      console.error('Error loading campaign data:', err);
      setError('Failed to load campaign data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics
  const summaryMetrics = paidAdsData.reduce((acc, record) => ({
    totalSpend: acc.totalSpend + (record.spend || 0),
    totalImpressions: acc.totalImpressions + (record.impressions || 0),
    totalVisits: acc.totalVisits + (record.visits || 0),
    totalLeads: acc.totalLeads + (record.leads || 0),
    totalRevenue: acc.totalRevenue + (record.total_estimated_revenue || 0),
    totalAppointments: acc.totalAppointments + (record.total_appointments || 0)
  }), {
    totalSpend: 0,
    totalImpressions: 0,
    totalVisits: 0,
    totalLeads: 0,
    totalRevenue: 0,
    totalAppointments: 0
  });

  // Calculate derived metrics
  const avgCTR = summaryMetrics.totalImpressions > 0 ? summaryMetrics.totalVisits / summaryMetrics.totalImpressions : 0;
  const avgConversion = summaryMetrics.totalVisits > 0 ? summaryMetrics.totalLeads / summaryMetrics.totalVisits : 0;
  const avgCostPerLead = summaryMetrics.totalLeads > 0 ? summaryMetrics.totalSpend / summaryMetrics.totalLeads : 0;
  const avgROAS = summaryMetrics.totalSpend > 0 ? summaryMetrics.totalRevenue / summaryMetrics.totalSpend : 0;

  // Process data for charts
  const campaignPerformance = paidAdsData.map(record => ({
    campaign: record.campaign,
    clinic: record.clinic,
    spend: record.spend || 0,
    revenue: record.total_estimated_revenue || 0,
    leads: record.leads || 0,
    roas: (record.spend && record.spend > 0) ? (record.total_estimated_revenue || 0) / record.spend : 0,
    ctr: (record.impressions && record.impressions > 0) ? (record.visits || 0) / record.impressions : 0,
    conversion_rate: (record.visits && record.visits > 0) ? (record.leads || 0) / record.visits : 0,
    cost_per_lead: (record.leads && record.leads > 0) ? (record.spend || 0) / record.leads : 0
  }));

  // Top performing campaigns
  const topCampaigns = [...campaignPerformance]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Table columns
  const campaignColumns: TableColumn<PaidAdsRecord>[] = [
    {
      key: 'clinic',
      title: 'Clinic',
      sortable: true,
      width: '150px'
    },
    {
      key: 'campaign',
      title: 'Campaign',
      sortable: true,
      width: '200px'
    },
    {
      key: 'month',
      title: 'Month',
      formatType: 'date',
      sortable: true,
      width: '120px'
    },
    {
      key: 'spend',
      title: 'Spend',
      formatType: 'currency',
      sortable: true,
      align: 'right'
    },
    {
      key: 'impressions',
      title: 'Impressions',
      formatType: 'number',
      sortable: true,
      align: 'right'
    },
    {
      key: 'visits',
      title: 'Clicks',
      formatType: 'number',
      sortable: true,
      align: 'right'
    },
    {
      key: 'leads',
      title: 'Leads',
      formatType: 'number',
      sortable: true,
      align: 'right'
    },
    {
      key: 'total_estimated_revenue',
      title: 'Revenue',
      formatType: 'currency',
      sortable: true,
      align: 'right'
    },
    {
      key: 'total_roas',
      title: 'ROAS',
      render: (value) => value ? `${value.toFixed(2)}x` : 'N/A',
      sortable: true,
      align: 'right'
    }
  ];

  if (error) {
    return (
      <DashboardLayout title="Campaign Performance" subtitle="Paid advertising campaign analysis">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Campaigns</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCampaignData}
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
      title="Campaign Performance" 
      subtitle="Paid advertising campaign analysis and optimization"
    >
      <div className="space-y-8">
        {/* Filters */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paid Advertising Performance
            </h2>
            <p className="text-gray-600">
              Analyze campaign effectiveness across {filters.companies.length || filterOptions.companies.length} companies
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Ad Spend"
            value={summaryMetrics.totalSpend}
            formatType="currency"
            subtitle={`${paidAdsData.length} campaigns`}
            isLoading={loading}
          />
          <MetricCard
            title="Total Revenue"
            value={summaryMetrics.totalRevenue}
            formatType="currency"
            subtitle="From paid ads"
            isLoading={loading}
          />
          <MetricCard
            title="Average ROAS"
            value={avgROAS}
            formatType="number"
            subtitle="Return on ad spend"
            isLoading={loading}
          />
          <MetricCard
            title="Total Leads"
            value={summaryMetrics.totalLeads}
            formatType="number"
            subtitle="From all campaigns"
            isLoading={loading}
          />
        </div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Avg Click-Through Rate"
            value={avgCTR}
            formatType="percent"
            size="small"
            isLoading={loading}
          />
          <MetricCard
            title="Avg Conversion Rate"
            value={avgConversion}
            formatType="percent"
            size="small"
            isLoading={loading}
          />
          <MetricCard
            title="Avg Cost per Lead"
            value={avgCostPerLead}
            formatType="currency"
            size="small"
            isLoading={loading}
          />
          <MetricCard
            title="Total Impressions"
            value={summaryMetrics.totalImpressions}
            formatType="number"
            size="small"
            isLoading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Campaigns by Revenue */}
          <ChartContainer
            title="Top Campaigns by Revenue"
            subtitle="Best performing campaigns"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCampaigns} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="campaign" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* ROAS vs Spend Scatter */}
          <ChartContainer
            title="ROAS vs Spend Analysis"
            subtitle="Campaign efficiency analysis"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="spend" 
                  name="Spend"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  dataKey="roas" 
                  name="ROAS"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => {
                    if (name === 'spend') return [`$${(value as number).toLocaleString()}`, 'Spend'];
                    return [`${(value as number).toFixed(2)}x`, 'ROAS'];
                  }}
                />
                <Scatter dataKey="roas" fill="#16a34a" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Performance Metrics Chart */}
        <ChartContainer
          title="Campaign Performance Metrics"
          subtitle="Cost per lead vs conversion rate analysis"
          loading={loading}
          height={400}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCampaigns.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="campaign" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost_per_lead" fill="#dc2626" name="Cost per Lead" />
              <Bar dataKey="conversion_rate" fill="#16a34a" name="Conversion Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Detailed Campaign Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            All Campaign Performance Data
          </h3>
          <DataTable
            data={paidAdsData}
            columns={campaignColumns}
            loading={loading}
            searchable={true}
            sortable={true}
            exportable={true}
            pagination={true}
            pageSize={25}
            emptyMessage="No campaign data available for the selected filters"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}