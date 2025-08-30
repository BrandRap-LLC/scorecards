'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { ChartContainer } from '@/components/ChartContainer';
import { CompanyPageProps, TableColumn } from '@/types/dashboard';
import { 
  getExecutiveMonthlyReports,
  getExecutiveWeeklyReports,
  getExecutiveCompanies 
} from '@/lib/api-executive';
import { ExecutiveMonthlyReport, ExecutiveWeeklyReport } from '@/types/executive';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type ReportData = ExecutiveMonthlyReport | ExecutiveWeeklyReport;

export default function CompanyDashboardPage({ params, searchParams }: CompanyPageProps) {
  const router = useRouter();
  const [company, setCompany] = useState<string>('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);

  // Get company display name
  const getCompanyDisplayName = (companyId: string) => {
    const displayNames: Record<string, string> = {
      'advancedlifeclinic.com': 'Advanced Life Clinic',
      'alluraderm.com': 'Alluraderm',
      'bismarckbotox.com': 'Bismarck Botox',
      'drridha.com': 'Dr. Ridha',
      'genesis-medspa.com': 'Genesis MedSpa',
      'greenspringaesthetics.com': 'Greenspring Aesthetics',
      'kovakcosmeticcenter.com': 'Kovak Cosmetic Center',
      'mirabilemd.com': 'Mirabile MD',
      'myskintastic.com': 'My Skintastic',
      'skincareinstitute.net': 'Skincare Institute',
      'skinjectables.com': 'Skinjectables'
    };
    return displayNames[companyId] || companyId.replace('.com', '').replace('.net', '');
  };

  const companyDisplayName = getCompanyDisplayName(company);

  // Initialize params and searchParams
  useEffect(() => {
    async function initializeParams() {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      
      setCompany(resolvedParams.company);
      setPeriod((resolvedSearchParams.period as 'monthly' | 'weekly') || 'monthly');
    }
    
    initializeParams();
  }, [params, searchParams]);

  // Load data
  useEffect(() => {
    if (company) {
      loadCompanyData();
      loadAvailableCompanies();
    }
  }, [company, period]);

  const loadAvailableCompanies = async () => {
    try {
      const companies = await getExecutiveCompanies();
      setAvailableCompanies(companies);
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = period === 'monthly' 
        ? await getExecutiveMonthlyReports({ companies: [company] })
        : await getExecutiveWeeklyReports({ companies: [company] });

      setReportData(data);
    } catch (err) {
      console.error('Error loading company data:', err);
      setError('Failed to load company data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    if (reportData.length === 0) return {
      totalRevenue: null,
      totalLeads: null,
      totalAppointments: null,
      totalSpend: null,
      costPerLead: null,
      costPerAppointment: null,
      roas: null,
      conversionRate: null
    };

    const totals = reportData.reduce((acc, report) => ({
      revenue: acc.revenue + (report.total_estimated_revenue || 0),
      leads: acc.leads + (report.leads || 0),
      appointments: acc.appointments + (report.total_appointments || 0),
      spend: acc.spend + (report.spend || 0),
      visits: acc.visits + (report.visits || 0),
      impressions: acc.impressions + (report.impressions || 0)
    }), { revenue: 0, leads: 0, appointments: 0, spend: 0, visits: 0, impressions: 0 });

    return {
      totalRevenue: totals.revenue,
      totalLeads: totals.leads,
      totalAppointments: totals.appointments,
      totalSpend: totals.spend,
      costPerLead: totals.spend > 0 && totals.leads > 0 ? totals.spend / totals.leads : null,
      costPerAppointment: totals.spend > 0 && totals.appointments > 0 ? totals.spend / totals.appointments : null,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : null,
      conversionRate: totals.visits > 0 ? totals.leads / totals.visits : null
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const chartData = reportData.map(report => ({
    period: 'month' in report ? report.month : `W${report.week_number}`,
    revenue: report.total_estimated_revenue || 0,
    leads: report.leads || 0,
    appointments: report.total_appointments || 0,
    spend: report.spend || 0,
    roas: (report.spend || 0) > 0 ? (report.total_estimated_revenue || 0) / (report.spend || 0) : 0
  })).reverse(); // Show oldest to newest

  // Table columns
  const reportColumns: TableColumn<ReportData>[] = [
    {
      key: 'month' in reportData[0] ? 'month' : 'week',
      title: period === 'monthly' ? 'Month' : 'Week',
      sortable: true
    },
    {
      key: 'traffic_source',
      title: 'Traffic Source',
      sortable: true
    },
    {
      key: 'total_estimated_revenue',
      title: 'Revenue',
      formatType: 'currency',
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
      key: 'total_appointments',
      title: 'Appointments',
      formatType: 'number',
      sortable: true,
      align: 'right'
    },
    {
      key: 'spend',
      title: 'Spend',
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

  // Validate company exists
  if (availableCompanies.length > 0 && !availableCompanies.includes(company)) {
    return (
      <DashboardLayout title="Company Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Company Not Found</h3>
            <p className="text-gray-600 mb-4">The company "{company}" does not exist in our records.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        title={companyDisplayName}
        subtitle="Company performance dashboard"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCompanyData}
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
      title={companyDisplayName}
      subtitle={`${period === 'monthly' ? 'Monthly' : 'Weekly'} performance dashboard`}
    >
      <div className="space-y-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => {
                const newPeriod = e.target.value as 'monthly' | 'weekly';
                const url = new URL(window.location.href);
                url.searchParams.set('period', newPeriod);
                router.push(url.toString());
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly View</option>
              <option value="weekly">Weekly View</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            formatType="currency"
            subtitle={`From ${reportData.length} periods`}
            isLoading={loading}
          />
          <MetricCard
            title="Total Leads"
            value={metrics.totalLeads}
            formatType="number"
            subtitle="All traffic sources"
            isLoading={loading}
          />
          <MetricCard
            title="Total Appointments"
            value={metrics.totalAppointments}
            formatType="number"
            subtitle="Booked appointments"
            isLoading={loading}
          />
          <MetricCard
            title="Average ROAS"
            value={metrics.roas}
            formatType="number"
            subtitle="Return on ad spend"
            isLoading={loading}
          />
        </div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Cost per Lead"
            value={metrics.costPerLead}
            formatType="currency"
            size="small"
            isLoading={loading}
          />
          <MetricCard
            title="Cost per Appointment"
            value={metrics.costPerAppointment}
            formatType="currency"
            size="small"
            isLoading={loading}
          />
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate}
            formatType="percent"
            size="small"
            isLoading={loading}
          />
          <MetricCard
            title="Total Spend"
            value={metrics.totalSpend}
            formatType="currency"
            size="small"
            isLoading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Spend Trend */}
          <ChartContainer
            title="Revenue vs Spend"
            subtitle="Performance over time"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Spend"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* ROAS Trend */}
          <ChartContainer
            title="ROAS Performance"
            subtitle="Return on ad spend over time"
            loading={loading}
            height={350}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="roas" 
                  stroke="#16a34a" 
                  fill="#16a34a" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Detailed Data Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Detailed {period === 'monthly' ? 'Monthly' : 'Weekly'} Performance
          </h3>
          <DataTable
            data={reportData}
            columns={reportColumns}
            loading={loading}
            searchable={true}
            sortable={true}
            exportable={true}
            pagination={true}
            pageSize={25}
            emptyMessage={`No ${period} data available for ${companyDisplayName}`}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}