'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ChartContainer'
import { 
  ArrowLeft, 
  Search, 
  Trophy, 
  TrendingUp, 
  Target, 
  Calendar,
  Filter,
  Award,
  Crown,
  Star
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Company display names
const COMPANY_DISPLAY_NAMES: Record<string, string> = {
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

interface SEOHighlight {
  id: number
  company_name: string
  query_group: string
  query: string
  period: string
  period_type: string
  current_rank: number
  baseline_avg_rank: number
  highlight_reason: string
}

interface RankingDistribution {
  range: string
  count: number
  color: string
}

interface CategoryPerformance {
  category: string
  keywordCount: number
  avgRank: number
  topRankings: number
  avgImprovement: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']

export default function SEOCompanyDashboard() {
  const params = useParams()
  const company = params.company as string
  const displayName = COMPANY_DISPLAY_NAMES[company] || company

  const [highlights, setHighlights] = useState<SEOHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [rankingDistribution, setRankingDistribution] = useState<RankingDistribution[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([])

  useEffect(() => {
    fetchSEOData()
  }, [company])

  const fetchSEOData = async () => {
    try {
      setLoading(true)
      
      // Validate company exists in our allowed list
      const allowedCompanies = Object.keys(COMPANY_DISPLAY_NAMES)
      if (!allowedCompanies.includes(company)) {
        console.error('Invalid company:', company)
        // Redirect to not-found if company is not valid
        return
      }

      const { data, error } = await supabase
        .from('seo_highlights_keyword_page_one')
        .select('*')
        .eq('company_name', company)
        .order('current_rank', { ascending: true })
      
      if (error) throw error

      setHighlights(data || [])
      calculateAnalytics(data || [])
    } catch (error) {
      console.error('Error fetching SEO data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (data: SEOHighlight[]) => {
    // Calculate ranking distribution
    const distribution = [
      { range: '#1', count: 0, color: '#F59E0B' },
      { range: '2-3', count: 0, color: '#8B5CF6' },
      { range: '4-10', count: 0, color: '#3B82F6' },
      { range: '11-20', count: 0, color: '#10B981' },
      { range: '21+', count: 0, color: '#6B7280' }
    ]

    data.forEach(highlight => {
      const rank = highlight.current_rank
      if (rank === 1) distribution[0].count++
      else if (rank <= 3) distribution[1].count++
      else if (rank <= 10) distribution[2].count++
      else if (rank <= 20) distribution[3].count++
      else distribution[4].count++
    })

    setRankingDistribution(distribution)

    // Calculate category performance
    const categoryData: Record<string, {
      keywords: SEOHighlight[]
      totalRank: number
      topRankings: number
      totalImprovement: number
    }> = {}

    data.forEach(highlight => {
      if (highlight.query_group) {
        const categories = highlight.query_group.split(',').map(c => c.trim())
        categories.forEach(category => {
          if (!categoryData[category]) {
            categoryData[category] = {
              keywords: [],
              totalRank: 0,
              topRankings: 0,
              totalImprovement: 0
            }
          }
          
          categoryData[category].keywords.push(highlight)
          categoryData[category].totalRank += highlight.current_rank
          categoryData[category].totalImprovement += (highlight.baseline_avg_rank - highlight.current_rank)
          
          if (highlight.current_rank <= 3) {
            categoryData[category].topRankings++
          }
        })
      }
    })

    const categoryPerf: CategoryPerformance[] = Object.entries(categoryData).map(([category, data]) => ({
      category,
      keywordCount: data.keywords.length,
      avgRank: data.totalRank / data.keywords.length,
      topRankings: data.topRankings,
      avgImprovement: data.totalImprovement / data.keywords.length
    })).sort((a, b) => b.topRankings - a.topRankings)

    setCategoryPerformance(categoryPerf)
  }

  // Filter highlights by category
  const categories = ['all', ...new Set(highlights.flatMap(h => 
    h.query_group?.split(',').map(g => g.trim()) || []
  ))]

  const filteredHighlights = selectedCategory === 'all' 
    ? highlights 
    : highlights.filter(h => h.query_group?.includes(selectedCategory))

  // Calculate key metrics
  const numberOneRankings = filteredHighlights.filter(h => h.current_rank === 1).length
  const topThreeRankings = filteredHighlights.filter(h => h.current_rank <= 3).length
  const topTenRankings = filteredHighlights.filter(h => h.current_rank <= 10).length
  const avgImprovement = filteredHighlights.length > 0 
    ? filteredHighlights.reduce((sum, h) => sum + (h.baseline_avg_rank - h.current_rank), 0) / filteredHighlights.length
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SEO performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/seo" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {displayName} - SEO Performance
              </h1>
              <p className="text-gray-600 mt-1">{company}</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{numberOneRankings}</div>
                  <div className="text-sm text-yellow-700">#1 Rankings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">{topThreeRankings}</div>
                  <div className="text-sm text-purple-700">Top 3 Rankings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{topTenRankings}</div>
                  <div className="text-sm text-blue-700">Top 10 Rankings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">+{avgImprovement.toFixed(1)}</div>
                  <div className="text-sm text-green-700">Avg Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ranking Distribution Chart */}
          <ChartContainer title="Ranking Distribution" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Category Performance Chart */}
          <ChartContainer title="Performance by Category" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformance.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="topRankings" fill="#8B5CF6" name="Top 3 Rankings" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Keyword Achievements Gallery */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Keyword Achievement Gallery
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({filteredHighlights.length} keywords)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHighlights.slice(0, 12).map((highlight) => {
                const improvement = highlight.baseline_avg_rank - highlight.current_rank
                const isNumber1 = highlight.current_rank === 1
                const isTopThree = highlight.current_rank <= 3
                const isTopTen = highlight.current_rank <= 10

                return (
                  <div
                    key={highlight.id}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isNumber1 
                        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' 
                        : isTopThree 
                          ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50'
                          : isTopTen
                            ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        isNumber1
                          ? 'bg-yellow-400 text-yellow-900'
                          : isTopThree
                            ? 'bg-purple-500 text-white'
                            : isTopTen
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-500 text-white'
                      }`}>
                        {isNumber1 && '👑 '}#{Math.round(highlight.current_rank)}
                      </div>
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{improvement.toFixed(0)}
                      </div>
                    </div>

                    {/* Keyword */}
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {highlight.query}
                    </h4>

                    {/* Previous Rank */}
                    <p className="text-xs text-gray-500 mb-3">
                      Previously ranked #{Math.round(highlight.baseline_avg_rank)}
                    </p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                      {highlight.query_group?.split(',').slice(0, 2).map((group, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {group.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Achievement Crown for #1 */}
                    {isNumber1 && (
                      <div className="absolute -top-2 -right-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="h-4 w-4 text-yellow-900" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filteredHighlights.length > 12 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Showing 12 of {filteredHighlights.length} keyword achievements
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-right p-3 font-semibold">Keywords</th>
                    <th className="text-right p-3 font-semibold">Top 3 Rankings</th>
                    <th className="text-right p-3 font-semibold">Avg Rank</th>
                    <th className="text-right p-3 font-semibold">Avg Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerformance.map((category, idx) => (
                    <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{category.category}</td>
                      <td className="p-3 text-right">{category.keywordCount}</td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {category.topRankings}
                        </span>
                      </td>
                      <td className="p-3 text-right">#{category.avgRank.toFixed(1)}</td>
                      <td className="p-3 text-right text-green-600 font-semibold">
                        +{category.avgImprovement.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}