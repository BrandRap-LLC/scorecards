'use client'

import { useState, useEffect } from 'react'
import { getHistoricalWeeks, getCompanies, formatWeekDisplay } from '@/lib/api-weekly'
import { WeeklyMetric } from '@/types/scorecards'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { getHeatmapColor } from '@/lib/heatmap'
import { Download, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import HeatmapLegend from '@/components/HeatmapLegend'

interface WeeklyGridData {
  [companyId: number]: {
    companyName: string
    displayName: string
    metrics: {
      [metricId: number]: {
        metricName: string
        metricCode: string
        category: string
        formatType: string
        weeklyValues: {
          [weekNumber: string]: {
            value: number | null
            is_mtd: boolean
            week_start: string
            week_end: string
            wow_percent: number | null
          }
        }
      }
    }
  }
}

export default function GridPage() {
  const [historicalData, setHistoricalData] = useState<WeeklyGridData>({})
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set())
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const [weekHeaders, setWeekHeaders] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [historicalMetrics, companiesData] = await Promise.all([
        getHistoricalWeeks(12),
        getCompanies()
      ])

      // Organize data by company and metric
      const organized: WeeklyGridData = {}
      const weeks = new Set<string>()
      
      historicalMetrics.forEach((record: WeeklyMetric) => {
        const weekKey = `${record.year}-W${record.week_number.toString().padStart(2, '0')}`
        weeks.add(weekKey)
        
        if (!organized[record.company_id]) {
          organized[record.company_id] = {
            companyName: record.company_name,
            displayName: record.company_display_name,
            metrics: {}
          }
        }
        
        if (!organized[record.company_id].metrics[record.metric_id]) {
          organized[record.company_id].metrics[record.metric_id] = {
            metricName: record.metric_name,
            metricCode: record.metric_code,
            category: record.category,
            formatType: record.format_type,
            weeklyValues: {}
          }
        }
        
        organized[record.company_id].metrics[record.metric_id].weeklyValues[weekKey] = {
          value: record.value,
          is_mtd: record.is_mtd,
          week_start: record.week_start_date,
          week_end: record.week_end_date,
          wow_percent: record.wow_percent
        }
      })

      // Sort weeks and take most recent 12
      const sortedWeeks = Array.from(weeks).sort().reverse().slice(0, 12)
      setWeekHeaders(sortedWeeks) // Show newest to oldest
      
      setHistoricalData(organized)
      setCompanies(companiesData)
      
      // Expand first company by default
      if (companiesData.length > 0) {
        setExpandedCompanies(new Set([companiesData[0].id]))
      }
    } catch (error) {
      console.error('Error loading grid data:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleCompany(companyId: number) {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }

  function formatValue(value: number | null, formatType: string): string {
    if (value === null || value === undefined) return '-'
    
    switch (formatType) {
      case 'currency':
        return formatCurrency(value)
      case 'percent':
        return formatPercent(value)
      case 'rating':
        return value.toFixed(1)
      default:
        return formatNumber(value)
    }
  }

  function getWeekDisplayHeader(weekKey: string): string {
    const [year, weekPart] = weekKey.split('-W')
    const weekNum = parseInt(weekPart)
    return `W${weekNum}`
  }

  function exportToCSV() {
    const headers = ['Company', 'Metric', 'Category', ...weekHeaders.map(w => getWeekDisplayHeader(w))]
    const rows: string[][] = []
    
    Object.entries(historicalData).forEach(([companyId, companyData]) => {
      Object.values(companyData.metrics).forEach((metric: any) => {
        const row = [
          companyData.displayName,
          metric.metricName,
          metric.category,
          ...weekHeaders.map(week => {
            const weekData = metric.weeklyValues[week]
            return weekData ? formatValue(weekData.value, metric.formatType) : '-'
          })
        ]
        rows.push(row)
      })
    })
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scorecards_grid_12weeks.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading 12-week grid...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">12-Week Grid View</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Weekly performance metrics</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <HeatmapLegend showInverted={true} className="mb-4" />
      
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-medium text-gray-500 mr-2">Filter:</span>
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

      {/* Grid Tables */}
      <div className="space-y-6">
        {Object.entries(historicalData)
          .filter(([companyId]) => selectedCompany === null || parseInt(companyId) === selectedCompany)
          .map(([companyId, companyData]) => {
            const isExpanded = expandedCompanies.has(parseInt(companyId))
            const metrics = Object.values(companyData.metrics)
            
            // Group metrics by category
            const metricsByCategory: Record<string, any[]> = {}
            metrics.forEach((metric: any) => {
              const category = metric.category
              if (!metricsByCategory[category]) {
                metricsByCategory[category] = []
              }
              metricsByCategory[category].push(metric)
            })
            
            return (
              <div key={companyId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Company Header */}
                <button
                  onClick={() => toggleCompany(parseInt(companyId))}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">{companyData.displayName}</h2>
                    <span className="text-xs sm:text-sm text-gray-500">({companyData.companyName})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {/* Metrics Table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="sticky left-0 z-10 bg-gray-50 px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          {weekHeaders.map(week => {
                            const isCurrentWeek = weekHeaders.indexOf(week) === weekHeaders.length - 1
                            return (
                              <th 
                                key={week} 
                                className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                  isCurrentWeek ? 'bg-blue-50' : ''
                                }`}
                              >
                                {getWeekDisplayHeader(week)}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
                          <>
                            {/* Category Header */}
                            <tr key={`category-${category}`} className="bg-gray-50">
                              <td colSpan={weekHeaders.length + 1} className="px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700">
                                {category}
                              </td>
                            </tr>
                            {/* Metrics Rows */}
                            {categoryMetrics.map((metric, index) => (
                              <tr key={`${metric.metricCode}-${index}`} className="hover:bg-gray-50">
                                <td className="sticky left-0 z-10 bg-white px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                                  <div className="truncate max-w-[120px] sm:max-w-none" title={metric.metricName}>
                                    {metric.metricName}
                                  </div>
                                </td>
                                {weekHeaders.map(week => {
                                  const weekData = metric.weeklyValues[week]
                                  const isCurrentWeek = weekHeaders.indexOf(week) === weekHeaders.length - 1
                                  
                                  // Collect all values for this metric across all weeks for heatmap
                                  const allMetricValues = weekHeaders.map(w => 
                                    metric.weeklyValues[w]?.value
                                  ).filter(v => v !== null && v !== undefined)
                                  
                                  // Get heatmap colors
                                  const { bgColor, textColor } = getHeatmapColor(
                                    weekData?.value,
                                    allMetricValues,
                                    metric.metricCode
                                  )
                                  
                                  return (
                                    <td 
                                      key={week} 
                                      className={`px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center ${
                                        isCurrentWeek ? 'ring-2 ring-blue-400 ring-inset' : ''
                                      } ${bgColor}`}
                                    >
                                      <div className="flex flex-col items-center">
                                        <span className={`font-medium ${textColor}`}>
                                          {weekData ? formatValue(weekData.value, metric.formatType) : '-'}
                                        </span>
                                        {weekData?.is_mtd && (
                                          <span title="MTD - Incomplete">
                                            <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                                          </span>
                                        )}
                                        {weekData?.wow_percent !== null && weekData.wow_percent !== 0 && (
                                          <span className={`text-xs mt-0.5 ${
                                            weekData.wow_percent > 0 ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {weekData.wow_percent > 0 ? '↑' : '↓'}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* Info Footer */}
      <div className="mt-4 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">Grid View Information</h3>
        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
          <li>• Data shows the most recent 12 weeks of metrics</li>
          <li>• Current week (highlighted) may show MTD values if week is incomplete</li>
          <li>• Yellow triangle (⚠) indicates month-to-date/incomplete data</li>
          <li>• Arrows indicate week-over-week changes</li>
          <li>• Click company headers to expand/collapse metric tables</li>
        </ul>
      </div>
    </div>
  )
}