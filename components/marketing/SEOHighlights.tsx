'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, TrendingUp, Trophy, Target, Calendar } from 'lucide-react'

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

interface SEOHighlightsProps {
  clinic: string
}

export default function SEOHighlights({ clinic }: SEOHighlightsProps) {
  const [highlights, setHighlights] = useState<SEOHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  useEffect(() => {
    fetchHighlights()
  }, [clinic])

  const fetchHighlights = async () => {
    try {
      setLoading(true)
      setError(null)
      const url = `/api/seo-highlights?clinic=${encodeURIComponent(clinic)}`
      console.log('Fetching SEO highlights from:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Check if we got an error response
      if (data.error) {
        console.error('API returned error:', data.error, data.details)
        setError(data.details || data.error)
        return
      }
      
      setHighlights(data)
      console.log(`SEO Highlights loaded: ${data.length} items for ${clinic}`)
    } catch (err) {
      console.error('Error fetching highlights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load SEO highlights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-6 space-y-4">
        {/* Skeleton loader for stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
        {/* Skeleton loader for main card */}
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="mb-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Failed to Load SEO Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchHighlights()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't show anything if there are no highlights (but log it)
  if (highlights.length === 0) {
    console.log(`No SEO highlights found for ${clinic}`)
    return null
  }

  // Get unique query groups
  const queryGroups = ['all', ...new Set(highlights.flatMap(h => 
    h.query_group?.split(',').map(g => g.trim()) || []
  ))]

  // Filter highlights by selected group
  const filteredHighlights = selectedGroup === 'all' 
    ? highlights 
    : highlights.filter(h => h.query_group?.includes(selectedGroup))

  // Get stats
  const topRankings = filteredHighlights.filter(h => h.current_rank <= 3).length
  const topTenRankings = filteredHighlights.filter(h => h.current_rank <= 10).length
  const avgImprovement = filteredHighlights.reduce((sum, h) => 
    sum + (h.baseline_avg_rank - h.current_rank), 0
  ) / filteredHighlights.length

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    return `${month} ${day}`
  }

  // Get the most recent period from the highlights
  const sortedByPeriod = [...highlights].sort((a, b) => 
    new Date(b.period).getTime() - new Date(a.period).getTime()
  )
  const periodDate = sortedByPeriod[0]?.period
  const periodType = sortedByPeriod[0]?.period_type

  return (
    <div className="mb-6">
      {/* Main Highlights Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl text-gray-900">
              SEO Ranking Achievements
              <span className="block sm:inline text-sm font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
                Keywords with significant ranking improvements
              </span>
            </CardTitle>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {queryGroups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedGroup === group
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {group === 'all' ? 'All Categories' : group}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredHighlights.map((highlight) => {
              const improvement = highlight.baseline_avg_rank - highlight.current_rank
              const isTopRank = highlight.current_rank <= 3
              const isNumber1 = highlight.current_rank === 1

              return (
                <div
                  key={highlight.id}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isNumber1 
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' 
                      : isTopRank 
                        ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      isNumber1
                        ? 'bg-yellow-400 text-yellow-900'
                        : isTopRank
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-500 text-white'
                    }`}>
                      {isNumber1 && '🏆 '}#{Math.round(highlight.current_rank)}
                    </div>
                    <div className="flex items-center text-green-600 text-xs font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{improvement.toFixed(0)}
                    </div>
                  </div>

                  {/* Keyword */}
                  <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                    {highlight.query}
                  </h4>

                  {/* Previous Rank */}
                  <p className="text-xs text-gray-500 mb-2">
                    Was at position {Math.round(highlight.baseline_avg_rank)}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {highlight.query_group?.split(',').slice(0, 2).map((group, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {group.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Achievement Icon */}
                  {isNumber1 && (
                    <div className="absolute -top-2 -right-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="relative w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-lg">👑</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}