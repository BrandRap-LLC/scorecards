'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ChartContainer'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  ArrowUpDown,
  Trophy,
  DollarSign,
  Eye,
  UserCheck,
  MessageSquare
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { createClient } from '@supabase/supabase-js'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Company display names
const COMPANY_NAMES: Record<string, string> = {
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
}

interface CompanyMetrics {
  clinic: string
  displayName: string
  month: string
  leads: number
  visits: number
  spend: number
  conversion_rate: number
  cac_total: number
  total_appointments: number
  conversations_total: number
  ltv: number
  roas: number
  estimated_ltv_6m: number
}

interface CompanyRanking {
  clinic: string
  displayName: string
  score: number
  leads: number
  conversion_rate: number
  roas: number
  appointments: number
  rank: number
}

interface TimeSeriesData {
  month: string
  [key: string]: string | number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6']

const METRICS_CONFIG = [
  { key: 'leads', label: 'Total Leads', format: 'number', color: '#3B82F6' },
  { key: 'visits', label: 'Website Visits', format: 'number', color: '#10B981' },
  { key: 'spend', label: 'Ad Spend', format: 'currency', color: '#F59E0B' },
  { key: 'conversion_rate', label: 'Conversion Rate', format: 'percent', color: '#EF4444' },
  { key: 'total_appointments', label: 'Appointments', format: 'number', color: '#8B5CF6' },
  { key: 'roas', label: 'ROAS', format: 'number', color: '#06B6D4' }
]

export default function ComparisonDashboard() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetrics[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [companyRankings, setCompanyRankings] = useState<CompanyRanking[]>([])
  const [selectedMetric, setSelectedMetric] = useState('leads')
  const [selectedPeriod, setSelectedPeriod] = useState('6')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      fetchComparisonData()
    }
  }, [selectedCompanies, selectedPeriod])

  const fetchAvailableCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .select('clinic')
        .order('clinic')
      
      if (error) throw error

      const unique = Array.from(new Set(data.map(item => item.clinic)))
      setAvailableCompanies(unique)
      
      // Auto-select top 4 companies for initial comparison
      if (unique.length > 0) {
        setSelectedCompanies(unique.slice(0, 4))
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchComparisonData = async () => {
    if (selectedCompanies.length === 0) return

    try {
      setLoading(true)
      
      // Calculate date range based on selected period
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - parseInt(selectedPeriod))

      // Fetch monthly data for selected companies and period
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .in('clinic', selectedCompanies)
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])
        .order('month', { ascending: true })
        .order('clinic', { ascending: true })
      
      if (error) throw error

      // Process data for metrics comparison
      const processedMetrics: CompanyMetrics[] = data.map(item => ({
        clinic: item.clinic,
        displayName: COMPANY_NAMES[item.clinic] || item.clinic,
        month: item.month,
        leads: item.leads || 0,
        visits: item.visits || 0,
        spend: item.spend || 0,
        conversion_rate: item.conversion_rate || 0,
        cac_total: item.cac_total || 0,
        total_appointments: item.total_appointments || 0,
        conversations_total: item.conversations_total || 0,
        ltv: item.ltv || 0,
        roas: item.roas || 0,
        estimated_ltv_6m: item.estimated_ltv_6m || 0
      }))

      setCompanyMetrics(processedMetrics)

      // Create time series data
      createTimeSeriesData(processedMetrics)

      // Calculate company rankings
      calculateRankings(processedMetrics)

    } catch (error) {
      console.error('Error fetching comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTimeSeriesData = (data: CompanyMetrics[]) => {
    const monthlyData: Record<string, TimeSeriesData> = {}
    
    data.forEach(item => {
      const monthKey = new Date(item.month).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey }
      }
      
      monthlyData[monthKey][item.displayName] = item[selectedMetric as keyof CompanyMetrics] as number
    })
    
    const sortedData = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    )
    
    setTimeSeriesData(sortedData)
  }

  const calculateRankings = (data: CompanyMetrics[]) => {
    // Calculate average metrics per company for ranking
    const companyAverages: Record<string, {
      clinic: string
      displayName: string
      leads: number
      conversion_rate: number
      roas: number
      appointments: number
      count: number
    }> = {}

    data.forEach(item => {
      if (!companyAverages[item.clinic]) {
        companyAverages[item.clinic] = {
          clinic: item.clinic,
          displayName: item.displayName,
          leads: 0,
          conversion_rate: 0,
          roas: 0,
          appointments: 0,
          count: 0
        }
      }
      
      const avg = companyAverages[item.clinic]
      avg.leads += item.leads
      avg.conversion_rate += item.conversion_rate
      avg.roas += item.roas
      avg.appointments += item.total_appointments
      avg.count++
    })

    // Calculate final averages and composite scores
    const rankings: CompanyRanking[] = Object.values(companyAverages).map(company => {
      const avgLeads = company.leads / company.count
      const avgConversionRate = company.conversion_rate / company.count
      const avgRoas = company.roas / company.count
      const avgAppointments = company.appointments / company.count
      
      // Calculate composite performance score (normalized)
      const score = (
        (avgLeads / 1000) * 0.3 +
        (avgConversionRate * 100) * 0.25 +
        (avgRoas / 10) * 0.25 +
        (avgAppointments / 100) * 0.2
      )
      
      return {
        clinic: company.clinic,
        displayName: company.displayName,
        score: score,
        leads: avgLeads,
        conversion_rate: avgConversionRate,
        roas: avgRoas,
        appointments: avgAppointments,
        rank: 0
      }
    })

    // Sort by score and assign ranks
    rankings.sort((a, b) => b.score - a.score)
    rankings.forEach((company, index) => {
      company.rank = index + 1
    })

    setCompanyRankings(rankings)
  }

  const toggleCompanySelection = (company: string) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(prev => prev.filter(c => c !== company))
    } else if (selectedCompanies.length < 6) {
      setSelectedCompanies(prev => [...prev, company])
    }
  }

  const formatValue = (value: number | null, format: string) => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percent':
        return formatPercent(value)
      case 'number':
        return formatNumber(value)
      default:
        return value.toString()
    }
  }

  const getLatestMetrics = () => {
    if (companyMetrics.length === 0) return []
    
    const latestMonth = Math.max(...companyMetrics.map(m => new Date(m.month).getTime()))
    const latestData = companyMetrics.filter(m => new Date(m.month).getTime() === latestMonth)
    
    return selectedCompanies.map(company => {
      const companyData = latestData.find(d => d.clinic === company)
      return {
        clinic: company,
        displayName: COMPANY_NAMES[company] || company,
        ...companyData
      }
    }).filter(Boolean)
  }

  if (loading && selectedCompanies.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Multi-Company Performance Comparison
          </h1>
          <p className="text-lg text-gray-600">
            Compare key performance metrics across multiple companies
          </p>
        </div>

        {/* Company Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Companies to Compare
              <span className="text-sm font-normal text-gray-600">
                (Select up to 6 companies)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {availableCompanies.map((company, index) => (
                <button
                  key={company}
                  onClick={() => toggleCompanySelection(company)}
                  disabled={!selectedCompanies.includes(company) && selectedCompanies.length >= 6}
                  className={`p-3 text-sm rounded-lg border-2 transition-all ${
                    selectedCompanies.includes(company)
                      ? `bg-blue-50 border-blue-500 text-blue-700`
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  } ${
                    !selectedCompanies.includes(company) && selectedCompanies.length >= 6
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: selectedCompanies.includes(company) 
                      ? `${COLORS[selectedCompanies.indexOf(company)]}20`
                      : undefined,
                    borderColor: selectedCompanies.includes(company) 
                      ? COLORS[selectedCompanies.indexOf(company)]
                      : undefined,
                  }}
                >
                  <div className="font-medium text-center leading-tight">
                    {COMPANY_NAMES[company] || company}
                  </div>
                </button>
              ))}
            </div>

            {/* Period Selection */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Time Period:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: '3', label: '3 months' },
                  { value: '6', label: '6 months' },
                  { value: '12', label: '12 months' }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCompanies.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select Companies to Compare
            </h3>
            <p className="text-gray-600">
              Choose 2-6 companies from the list above to start comparing their performance
            </p>
          </div>
        )}

        {selectedCompanies.length > 0 && (
          <>
            {/* Performance Rankings */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Performance Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyRankings.map((company, index) => (
                    <div
                      key={company.clinic}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                          : index === 1
                            ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                            : index === 2
                              ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                              : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 
                            ? 'bg-yellow-400 text-yellow-900'
                            : index === 1
                              ? 'bg-gray-400 text-gray-900'
                              : index === 2
                                ? 'bg-orange-400 text-orange-900'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : company.rank}
                        </div>
                        <div>
                          <div className="font-semibold">{company.displayName}</div>
                          <div className="text-sm text-gray-600">
                            Score: {company.score.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>Leads: {formatNumber(company.leads)}</div>
                        <div>Conv. Rate: {formatPercent(company.conversion_rate)}</div>
                        <div>ROAS: {company.roas.toFixed(2)}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metric Selection and Time Series Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {METRICS_CONFIG.map(metric => (
                        <option key={metric.key} value={metric.key}>
                          {metric.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatValue(value as number, METRICS_CONFIG.find(m => m.label === name)?.format || 'number'),
                            name
                          ]}
                        />
                        <Legend />
                        {selectedCompanies.map((company, index) => (
                          <Line
                            key={company}
                            type="monotone"
                            dataKey={COMPANY_NAMES[company] || company}
                            stroke={COLORS[index]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Metrics Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Latest Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getLatestMetrics().map((company, index) => (
                      <div key={company.clinic} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div 
                          className="font-medium mb-2"
                          style={{ color: COLORS[index] }}
                        >
                          {company.displayName}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Leads:</span>
                            <span className="font-medium">{formatNumber(company.leads || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conv. Rate:</span>
                            <span className="font-medium">{formatPercent(company.conversion_rate || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ROAS:</span>
                            <span className="font-medium">{(company.roas || 0).toFixed(2)}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Appointments:</span>
                            <span className="font-medium">{formatNumber(company.total_appointments || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side-by-Side Metric Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Side-by-Side Metric Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold">Company</th>
                        <th className="text-right p-3 font-semibold">Leads</th>
                        <th className="text-right p-3 font-semibold">Visits</th>
                        <th className="text-right p-3 font-semibold">Conv. Rate</th>
                        <th className="text-right p-3 font-semibold">Ad Spend</th>
                        <th className="text-right p-3 font-semibold">ROAS</th>
                        <th className="text-right p-3 font-semibold">Appointments</th>
                        <th className="text-right p-3 font-semibold">LTV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLatestMetrics().map((company, index) => (
                        <tr key={company.clinic} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index] }}
                              />
                              <span className="font-medium">{company.displayName}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right">{formatNumber(company.leads || 0)}</td>
                          <td className="p-3 text-right">{formatNumber(company.visits || 0)}</td>
                          <td className="p-3 text-right">{formatPercent(company.conversion_rate || 0)}</td>
                          <td className="p-3 text-right">{formatCurrency(company.spend || 0)}</td>
                          <td className="p-3 text-right">{(company.roas || 0).toFixed(2)}x</td>
                          <td className="p-3 text-right">{formatNumber(company.total_appointments || 0)}</td>
                          <td className="p-3 text-right">{formatCurrency(company.ltv || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}