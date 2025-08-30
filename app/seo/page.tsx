'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Search, Trophy, CheckCircle, TrendingUp, Target } from 'lucide-react'
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

interface SEOCompanyData {
  id: string
  name: string
  totalKeywords: number
  topRankings: number
  numberOneRankings: number
  avgImprovement: number
  topCategories: string[]
}

export default function SEODashboardList() {
  const [companies, setCompanies] = useState<SEOCompanyData[]>([])
  const [loading, setLoading] = useState(true)
  const [seoStats, setSeoStats] = useState({
    totalKeywords: 0,
    totalCompanies: 0,
    totalRankingOnes: 0,
    avgImprovement: 0
  })

  useEffect(() => {
    fetchSEOCompanies()
  }, [])

  const fetchSEOCompanies = async () => {
    try {
      // Fetch all SEO highlights data
      const { data, error } = await supabase
        .from('seo_highlights_keyword_page_one')
        .select('*')
        .order('current_rank', { ascending: true })
      
      if (error) throw error

      // Group data by company
      const companyData: Record<string, SEOCompanyData> = {}
      let totalKeywords = 0
      let totalRankingOnes = 0
      let totalImprovement = 0

      data.forEach((highlight) => {
        const companyId = highlight.company_name
        if (!companyData[companyId]) {
          companyData[companyId] = {
            id: companyId,
            name: COMPANY_NAMES[companyId] || companyId.replace('.com', '').replace('.net', ''),
            totalKeywords: 0,
            topRankings: 0,
            numberOneRankings: 0,
            avgImprovement: 0,
            topCategories: []
          }
        }

        const company = companyData[companyId]
        const improvement = highlight.baseline_avg_rank - highlight.current_rank

        company.totalKeywords++
        totalKeywords++

        if (highlight.current_rank <= 3) {
          company.topRankings++
        }

        if (highlight.current_rank === 1) {
          company.numberOneRankings++
          totalRankingOnes++
        }

        totalImprovement += improvement

        // Track categories
        if (highlight.query_group) {
          const categories = highlight.query_group.split(',').map((c: string) => c.trim())
          categories.forEach((category: string) => {
            if (!company.topCategories.includes(category)) {
              company.topCategories.push(category)
            }
          })
        }
      })

      // Calculate average improvement per company
      Object.values(companyData).forEach(company => {
        const companyHighlights = data.filter(h => h.company_name === company.id)
        company.avgImprovement = companyHighlights.reduce((sum, h) => 
          sum + (h.baseline_avg_rank - h.current_rank), 0
        ) / companyHighlights.length
      })

      // Sort companies by total keywords and number one rankings
      const sortedCompanies = Object.values(companyData)
        .sort((a, b) => {
          if (b.numberOneRankings !== a.numberOneRankings) {
            return b.numberOneRankings - a.numberOneRankings
          }
          return b.totalKeywords - a.totalKeywords
        })

      setCompanies(sortedCompanies)
      setSeoStats({
        totalKeywords,
        totalCompanies: sortedCompanies.length,
        totalRankingOnes,
        avgImprovement: totalImprovement / totalKeywords
      })
    } catch (error) {
      console.error('Error fetching SEO data:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            SEO Performance Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 px-4 mb-6">
            Keyword ranking achievements and search engine optimization insights
          </p>
          
          {/* SEO Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="text-center">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{seoStats.totalKeywords}</div>
              <div className="text-sm text-gray-600">Total Keywords</div>
            </div>
            <div className="text-center">
              <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{seoStats.totalRankingOnes}</div>
              <div className="text-sm text-gray-600">#1 Rankings</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{seoStats.avgImprovement.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Improvement</div>
            </div>
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{seoStats.totalCompanies}</div>
              <div className="text-sm text-gray-600">Active Companies</div>
            </div>
          </div>
        </div>

        {/* Company Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Select Company for Detailed SEO Analysis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {companies.map((company) => (
              <Link 
                key={company.id} 
                href={`/seo/${company.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full bg-white border-2 hover:border-blue-200">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center justify-between text-gray-900 text-base sm:text-lg">
                      <span className="truncate pr-2">{company.name}</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-xs sm:text-sm text-gray-600 truncate mb-3">
                      {company.id}
                    </p>
                    
                    {/* Key Metrics */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Total Keywords</span>
                        <span className="font-semibold text-gray-900">{company.totalKeywords}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">#1 Rankings</span>
                        <span className="font-semibold text-yellow-600">{company.numberOneRankings}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Top 3 Rankings</span>
                        <span className="font-semibold text-purple-600">{company.topRankings}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Avg Improvement</span>
                        <span className="font-semibold text-green-600">+{company.avgImprovement.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Top Categories */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">Categories</div>
                      <div className="flex flex-wrap gap-1">
                        {company.topCategories.slice(0, 3).map((category, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                          >
                            {category}
                          </span>
                        ))}
                        {company.topCategories.length > 3 && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            +{company.topCategories.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Performance Badge */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full font-semibold ${
                        company.numberOneRankings > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : company.topRankings > 0 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {company.numberOneRankings > 0 
                          ? '🏆 Champion' 
                          : company.topRankings > 0 
                            ? '🥇 Top Performer'
                            : '📈 Growing'
                        }
                      </span>
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
            <Search className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              SEO Performance Intelligence
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Track keyword ranking improvements, achievements, and search engine optimization 
              performance across all clinic locations with detailed insights and trends.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>{seoStats.totalKeywords}+</strong> Keywords Tracked
              </div>
              <div>
                <strong>{seoStats.totalRankingOnes}+</strong> #1 Rankings Achieved
              </div>
              <div>
                <strong>{seoStats.totalCompanies}+</strong> Companies Monitored
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}