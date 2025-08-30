'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  BarChart3, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Target, 
  Database,
  Users,
  Calendar
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Static company display names
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

// Dashboard navigation options
const DASHBOARD_OPTIONS = [
  {
    href: '/dashboard',
    title: 'Executive Dashboard',
    description: 'Complete performance overview across all companies',
    icon: BarChart3,
    color: 'bg-blue-50 text-blue-600',
    features: ['Monthly & weekly metrics', 'Cross-company analysis', 'Key performance indicators']
  },
  {
    href: '/compare',
    title: 'Multi-Company Comparison',
    description: 'Side-by-side performance comparison between companies',
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
    features: ['Performance rankings', 'Comparative charts', 'Metric benchmarking']
  },
  {
    href: '/seo',
    title: 'SEO Performance',
    description: 'Keyword ranking achievements and search optimization',
    icon: Activity,
    color: 'bg-green-50 text-green-600',
    features: ['Keyword rankings', 'Achievement showcase', 'Category analysis']
  },
  {
    href: '/analytics',
    title: 'Analytics & Trends',
    description: 'Time series analysis and performance trends',
    icon: TrendingUp,
    color: 'bg-orange-50 text-orange-600',
    features: ['Interactive charts', 'Trend analysis', 'Metric correlation']
  },
  {
    href: '/campaigns',
    title: 'Campaign Performance',
    description: 'Paid advertising campaign analysis',
    icon: Target,
    color: 'bg-red-50 text-red-600',
    features: ['Campaign ROI', 'Spend optimization', 'Performance ranking']
  },
  {
    href: '/data',
    title: 'Raw Data Access',
    description: 'Direct access to all datasets with export tools',
    icon: Database,
    color: 'bg-gray-50 text-gray-600',
    features: ['All data tables', 'Advanced filtering', 'CSV exports']
  }
]

export default function Home() {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; recordCount: number }>>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRecords: 0,
    latestMonth: '',
    activeCompanies: 0
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      // Fetch all unique companies from the database
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .select('clinic, month')
      
      if (error) throw error

      // Count records per company
      const companyCounts = data.reduce((acc: Record<string, number>, row) => {
        acc[row.clinic] = (acc[row.clinic] || 0) + 1
        return acc
      }, {})

      // Create company list with counts
      const companyList = Object.entries(companyCounts)
        .map(([id, count]) => ({
          id,
          name: COMPANY_NAMES[id] || id.replace('.com', '').replace('.net', ''),
          recordCount: count as number
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      // Calculate stats
      const latestMonth = data.length > 0 ? 
        data.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())[0].month :
        ''

      setCompanies(companyList)
      setStats({
        totalRecords: data.length,
        latestMonth: latestMonth ? new Date(latestMonth).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }) : '',
        activeCompanies: companyList.length
      })
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Marketing Analytics Platform
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 px-4 mb-6">
            Comprehensive performance insights across all marketing channels
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.activeCompanies}</div>
              <div className="text-sm text-gray-600">Active Companies</div>
            </div>
            <div className="text-center">
              <Database className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecords.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Data Points</div>
            </div>
            <div className="text-center">
              <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{stats.latestMonth}</div>
              <div className="text-sm text-gray-600">Latest Data</div>
            </div>
          </div>
        </div>

        {/* Dashboard Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Dashboard View
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {DASHBOARD_OPTIONS.map((option) => (
              <Link 
                key={option.href} 
                href={option.href}
                className="block"
              >
                <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full bg-white border-2 hover:border-blue-200">
                  <CardHeader className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${option.color}`}>
                        <option.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">
                          {option.title}
                        </CardTitle>
                        <p className="text-gray-600 mb-4">
                          {option.description}
                        </p>
                        <ul className="space-y-1">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Company Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Or Browse by Company
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {companies.map((company) => (
              <Link 
                key={company.id} 
                href={`/dashboard?company=${company.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full bg-white">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center justify-between text-gray-900 text-base sm:text-lg">
                      <span className="truncate pr-2">{company.name}</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {company.id}
                    </p>
                    <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs">
                      <span className="text-gray-600">{company.recordCount} records</span>
                      <span className="text-green-600 font-semibold">Active</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center px-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Real-time Marketing Intelligence
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Data continuously updated from all marketing channels including Google Ads, 
              Social Media, SEO, and organic sources across all clinic locations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>585+</strong> Monthly Reports
              </div>
              <div>
                <strong>2,391+</strong> Weekly Insights  
              </div>
              <div>
                <strong>816+</strong> Campaign Records
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}