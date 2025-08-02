'use client'

import { useState, useEffect } from 'react'
import { getLatestWeekMetrics, getCompanies, getCurrentWeekSummary, formatWeekDisplay } from '@/lib/api-weekly'
import { WeeklyMetric, WeeklySummary } from '@/types/scorecards'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { Calendar, TrendingUp, TrendingDown, AlertCircle, Building2, Download } from 'lucide-react'

export default function ScorecardsHome() {
  const [metrics, setMetrics] = useState<WeeklyMetric[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [weekSummary, setWeekSummary] = useState<WeeklySummary[]>([])
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedCompany])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      
      const [metricsData, companiesData, summaryData] = await Promise.all([
        getLatestWeekMetrics(selectedCompany ? [selectedCompany] : undefined),
        getCompanies(),
        getCurrentWeekSummary()
      ])
      
      setMetrics(metricsData)
      setCompanies(companiesData)
      setWeekSummary(summaryData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load scorecard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Group metrics by company
  const metricsByCompany = metrics.reduce((acc, metric) => {
    if (!acc[metric.company_id]) {
      acc[metric.company_id] = {
        company_name: metric.company_name,
        company_display_name: metric.company_display_name,
        is_mtd: metric.is_mtd,
        metrics: []
      }
    }
    acc[metric.company_id].metrics.push(metric)
    return acc
  }, {} as Record<number, any>)

  // Get current week info
  const currentWeek = weekSummary[0]
  const weekDisplay = currentWeek 
    ? formatWeekDisplay(currentWeek.week_number, currentWeek.week_start, currentWeek.week_end)
    : 'Current Week'

  function formatValue(value: number | null, formatType: string): string {
    if (value === null || value === undefined) return 'N/A'
    
    switch (formatType) {
      case 'currency':
        return formatCurrency(value)
      case 'percent':
        return formatPercent(value)
      case 'rating':
        return `${value.toFixed(1)}★`
      default:
        return formatNumber(value)
    }
  }

  function exportToCSV() {
    const headers = ['Company', 'Metric', 'Category', 'Value', 'WoW Change', 'WoW %', 'Status']
    const rows = metrics.map(m => [
      m.company_display_name,
      m.metric_name,
      m.category,
      formatValue(m.value, m.format_type),
      m.wow_change?.toFixed(2) || 'N/A',
      m.wow_percent ? `${(m.wow_percent * 100).toFixed(2)}%` : 'N/A',
      m.is_mtd ? 'MTD' : 'Complete'
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scorecards_week_${currentWeek?.week_number || 'current'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading weekly scorecards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Weekly Scorecards</h1>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{weekDisplay}</span>
              {currentWeek?.is_mtd && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  MTD - Incomplete Week
                </span>
              )}
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Company Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCompany(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedCompany === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            All Companies
          </button>
          {companies.map(company => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                selectedCompany === company.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {company.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* Company Sections */}
      <div className="space-y-6">
        {Object.entries(metricsByCompany).map(([companyId, companyData]: [string, any]) => (
          <div key={companyId} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Company Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {companyData.company_display_name}
                  </h2>
                  {companyData.is_mtd && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      MTD
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {companyData.metrics.length} metrics
                </span>
              </div>
            </div>

            {/* Metrics by Category */}
            <div className="p-6">
              {Object.entries(
                companyData.metrics.reduce((acc: any, metric: WeeklyMetric) => {
                  if (!acc[metric.category]) acc[metric.category] = []
                  acc[metric.category].push(metric)
                  return acc
                }, {})
              ).map(([category, categoryMetrics]: [string, any]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryMetrics.map((metric: WeeklyMetric) => (
                      <div
                        key={metric.id}
                        className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">{metric.metric_name}</h4>
                          {metric.wow_percent !== null && (
                            <div className="flex items-center gap-1">
                              {metric.wow_percent > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : metric.wow_percent < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-2xl font-bold text-gray-900">
                          {formatValue(metric.value, metric.format_type)}
                        </div>
                        
                        {metric.wow_percent !== null && (
                          <div className={`text-xs mt-2 ${
                            metric.wow_percent > 0 ? 'text-green-600' : 
                            metric.wow_percent < 0 ? 'text-red-600' : 
                            'text-gray-500'
                          }`}>
                            {metric.wow_percent > 0 ? '+' : ''}
                            {(metric.wow_percent * 100).toFixed(2)}% WoW
                          </div>
                        )}
                        
                        {metric.is_mtd && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Partial week data
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      {currentWeek?.is_mtd && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">MTD Data Notice</h3>
          <p className="text-sm text-yellow-800">
            The current week ({weekDisplay}) is showing month-to-date (MTD) values which represent 
            partial week data. Complete week values will be available after the week ends.
          </p>
        </div>
      )}
    </div>
  )
}