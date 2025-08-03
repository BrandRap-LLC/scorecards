'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, CheckCircle } from 'lucide-react'
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

export default function MarketingDashboardList() {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; recordCount: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      // Fetch all unique companies from the database
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .select('clinic')
      
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

      setCompanies(companyList)
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
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketing Performance Dashboards
          </h1>
          <p className="text-lg text-gray-700">
            Select a company to view their marketing channel performance
          </p>
          <div className="mt-4 inline-flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            {companies.length} companies with data available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link 
              key={company.id} 
              href={`/marketing/${company.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <span>{company.name}</span>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {company.id}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-gray-600">{company.recordCount} data points</span>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Data sourced from executive_monthly_reports table
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Showing last 5 months with month-over-month comparisons
          </p>
        </div>
      </div>
    </div>
  )
}