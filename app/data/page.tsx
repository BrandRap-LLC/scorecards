'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { FilterPanel } from '@/components/FilterPanel';
import { FilterState, TableColumn } from '@/types/dashboard';
import { 
  getExecutiveMonthlyReports,
  getExecutiveWeeklyReports,
  getExecutiveCompanies,
  getExecutiveTrafficSources,
  getExecutiveDateRange 
} from '@/lib/api-executive';
import { fetchPaidAdsData, fetchSeoChannelsData } from '@/lib/api-paid-seo';
import { ExecutiveMonthlyReport, ExecutiveWeeklyReport } from '@/types/executive';
import { PaidAdsRecord, SeoChannelsRecord } from '@/lib/api-paid-seo';
import { Database, Download, Table, BarChart3 } from 'lucide-react';

type DatasetType = 'executive_monthly' | 'executive_weekly' | 'paid_ads' | 'seo_channels';

export default function DataTablesPage() {
  const [activeDataset, setActiveDataset] = useState<DatasetType>('executive_monthly');
  const [data, setData] = useState<any[]>([]);
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

  // Dataset configurations
  const datasets = [
    {
      key: 'executive_monthly' as DatasetType,
      name: 'Executive Monthly Reports',
      description: 'Monthly executive metrics and KPIs',
      icon: BarChart3,
      recordCount: 0
    },
    {
      key: 'executive_weekly' as DatasetType,
      name: 'Executive Weekly Reports', 
      description: 'Weekly executive metrics and KPIs',
      icon: BarChart3,
      recordCount: 0
    },
    {
      key: 'paid_ads' as DatasetType,
      name: 'Paid Advertising Data',
      description: 'Campaign-level paid advertising performance',
      icon: Database,
      recordCount: 0
    },
    {
      key: 'seo_channels' as DatasetType,
      name: 'SEO Channel Data',
      description: 'SEO and organic traffic performance',
      icon: Database,
      recordCount: 0
    }
  ];

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadDataset();
  }, [activeDataset, filters]);

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

  const loadDataset = async () => {
    try {
      setLoading(true);
      setError(null);

      let loadedData: any[] = [];

      switch (activeDataset) {
        case 'executive_monthly':
          loadedData = await getExecutiveMonthlyReports({
            companies: filters.companies.length > 0 ? filters.companies : undefined,
            startDate: filters.startDate,
            endDate: filters.endDate,
            trafficSources: filters.trafficSources.length > 0 ? filters.trafficSources : undefined
          });
          break;
        
        case 'executive_weekly':
          loadedData = await getExecutiveWeeklyReports({
            companies: filters.companies.length > 0 ? filters.companies : undefined,
            startDate: filters.startDate,
            endDate: filters.endDate,
            trafficSources: filters.trafficSources.length > 0 ? filters.trafficSources : undefined
          });
          break;
        
        case 'paid_ads':
          loadedData = await fetchPaidAdsData(
            filters.companies.length === 1 ? filters.companies[0] : undefined,
            filters.startDate,
            filters.endDate
          );
          break;
        
        case 'seo_channels':
          loadedData = await fetchSeoChannelsData(
            filters.companies.length === 1 ? filters.companies[0] : undefined,
            filters.startDate,
            filters.endDate
          );
          break;
      }

      setData(loadedData);
    } catch (err) {
      console.error('Error loading dataset:', err);
      setError('Failed to load dataset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Column configurations for each dataset
  const getColumnsForDataset = (dataset: DatasetType): TableColumn<any>[] => {
    switch (dataset) {
      case 'executive_monthly':
        return [
          { key: 'clinic', title: 'Clinic', sortable: true, width: '150px' },
          { key: 'month', title: 'Month', sortable: true, width: '120px' },
          { key: 'traffic_source', title: 'Traffic Source', sortable: true, width: '130px' },
          { key: 'total_estimated_revenue', title: 'Revenue', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'leads', title: 'Leads', formatType: 'number', sortable: true, align: 'right' },
          { key: 'total_appointments', title: 'Appointments', formatType: 'number', sortable: true, align: 'right' },
          { key: 'spend', title: 'Spend', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'visits', title: 'Visits', formatType: 'number', sortable: true, align: 'right' },
          { key: 'cac_total', title: 'CAC', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'total_roas', title: 'ROAS', render: (value) => value ? `${value.toFixed(2)}x` : 'N/A', sortable: true, align: 'right' },
          { key: 'total_conversion', title: 'Conversion Rate', formatType: 'percent', sortable: true, align: 'right' }
        ];

      case 'executive_weekly':
        return [
          { key: 'clinic', title: 'Clinic', sortable: true, width: '150px' },
          { key: 'week', title: 'Week', sortable: true, width: '120px' },
          { key: 'traffic_source', title: 'Traffic Source', sortable: true, width: '130px' },
          { key: 'total_estimated_revenue', title: 'Revenue', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'leads', title: 'Leads', formatType: 'number', sortable: true, align: 'right' },
          { key: 'total_appointments', title: 'Appointments', formatType: 'number', sortable: true, align: 'right' },
          { key: 'spend', title: 'Spend', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'is_mtd', title: 'MTD', render: (value) => value ? 'Yes' : 'No', sortable: true, align: 'center' },
          { key: 'is_complete', title: 'Complete', render: (value) => value ? 'Yes' : 'No', sortable: true, align: 'center' }
        ];

      case 'paid_ads':
        return [
          { key: 'clinic', title: 'Clinic', sortable: true, width: '150px' },
          { key: 'month', title: 'Month', sortable: true, width: '120px' },
          { key: 'campaign', title: 'Campaign', sortable: true, width: '200px' },
          { key: 'traffic_source', title: 'Traffic Source', sortable: true, width: '130px' },
          { key: 'impressions', title: 'Impressions', formatType: 'number', sortable: true, align: 'right' },
          { key: 'visits', title: 'Clicks', formatType: 'number', sortable: true, align: 'right' },
          { key: 'spend', title: 'Spend', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'leads', title: 'Leads', formatType: 'number', sortable: true, align: 'right' },
          { key: 'total_appointments', title: 'Appointments', formatType: 'number', sortable: true, align: 'right' },
          { key: 'total_estimated_revenue', title: 'Revenue', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'total_roas', title: 'ROAS', render: (value) => value ? `${value.toFixed(2)}x` : 'N/A', sortable: true, align: 'right' }
        ];

      case 'seo_channels':
        return [
          { key: 'clinic', title: 'Clinic', sortable: true, width: '150px' },
          { key: 'month', title: 'Month', sortable: true, width: '120px' },
          { key: 'traffic_source', title: 'Traffic Source', sortable: true, width: '130px' },
          { key: 'impressions', title: 'Impressions', formatType: 'number', sortable: true, align: 'right' },
          { key: 'visits', title: 'Visits', formatType: 'number', sortable: true, align: 'right' },
          { key: 'leads', title: 'Leads', formatType: 'number', sortable: true, align: 'right' },
          { key: 'total_appointments', title: 'Appointments', formatType: 'number', sortable: true, align: 'right' },
          { key: 'total_estimated_revenue', title: 'Revenue', formatType: 'currency', sortable: true, align: 'right' },
          { key: 'total_conversion', title: 'Conversion Rate', formatType: 'percent', sortable: true, align: 'right' }
        ];

      default:
        return [];
    }
  };

  const currentDataset = datasets.find(d => d.key === activeDataset);
  const columns = getColumnsForDataset(activeDataset);

  if (error) {
    return (
      <DashboardLayout title="Data Tables" subtitle="Raw data access and export">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDataset}
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
      title="Data Tables" 
      subtitle="Access raw data with advanced filtering and export capabilities"
    >
      <div className="space-y-8">
        {/* Dataset Selection and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Raw Data Access
            </h2>
            <p className="text-gray-600">
              Explore and export detailed data from all available sources
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

        {/* Dataset Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {datasets.map((dataset) => {
              const Icon = dataset.icon;
              return (
                <button
                  key={dataset.key}
                  onClick={() => setActiveDataset(dataset.key)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeDataset === dataset.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {dataset.name}
                  {!loading && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {data.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dataset Info */}
        {currentDataset && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-1">
                  {currentDataset.name}
                </h3>
                <p className="text-blue-700 text-sm mb-2">
                  {currentDataset.description}
                </p>
                <div className="text-blue-600 text-sm">
                  {loading ? 'Loading...' : `${data.length} records found`}
                  {filters.startDate && filters.endDate && (
                    <span className="ml-4">
                      Date range: {filters.startDate} to {filters.endDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDataset?.name} Data
            </h3>
            <div className="text-sm text-gray-500">
              {!loading && `Showing ${data.length} records`}
            </div>
          </div>
          
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            searchable={true}
            sortable={true}
            exportable={true}
            pagination={true}
            pageSize={50}
            emptyMessage={`No ${currentDataset?.name.toLowerCase()} data available for the selected filters`}
          />
        </div>

        {/* Data Export Options */}
        {data.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Export Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Download className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">CSV Export</p>
                <p className="text-xs text-gray-600">Export filtered data as CSV file</p>
              </div>
              <div className="text-center">
                <Table className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Full Dataset</p>
                <p className="text-xs text-gray-600">Access complete unfiltered data</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">API Access</p>
                <p className="text-xs text-gray-600">Programmatic data access</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}