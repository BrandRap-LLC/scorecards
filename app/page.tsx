'use client'

import Link from 'next/link'
import { BarChart3, TrendingUp, Users, DollarSign, Target, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Channel Performance',
      description: 'Track and analyze marketing channel effectiveness across all traffic sources'
    },
    {
      icon: DollarSign,
      title: 'Cost Efficiency',
      description: 'Monitor CAC, ROAS, and spend allocation to optimize budget distribution'
    },
    {
      icon: Target,
      title: 'Conversion Tracking',
      description: 'Measure funnel performance from impressions to appointments'
    },
    {
      icon: Users,
      title: 'Multi-Company View',
      description: 'Dedicated dashboards for each of the 11 clinics with consistent metrics'
    }
  ]

  const stats = [
    { label: 'Companies', value: '11' },
    { label: 'Traffic Sources', value: '8' },
    { label: 'Data Points', value: '572+' },
    { label: 'Time Period', value: '9 months' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Marketing Analytics Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive marketing performance dashboards for multi-location healthcare clinics.
            Track channel effectiveness, optimize spend, and drive growth with data-driven insights.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/marketing"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              View Marketing Dashboards
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/marketing/advancedlifeclinic.com"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-blue-200"
            >
              View Demo Dashboard
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Marketing Analytics
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand and optimize your marketing performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Available Channels */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Track All Your Marketing Channels
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive coverage across all traffic sources
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Google Ads', color: 'bg-blue-500' },
                { name: 'Local SEO', color: 'bg-green-500' },
                { name: 'Organic SEO', color: 'bg-green-600' },
                { name: 'Social Ads', color: 'bg-blue-600' },
                { name: 'Organic Social', color: 'bg-pink-500' },
                { name: 'Reactivation', color: 'bg-purple-500' },
                { name: 'Others', color: 'bg-gray-500' },
                { name: 'Test', color: 'bg-amber-500' }
              ].map((channel, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${channel.color}`}></div>
                  <span className="font-medium text-gray-700">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to explore your marketing data?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Access detailed performance metrics for all your clinics
          </p>
          <Link
            href="/marketing"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-xl text-lg"
          >
            Access Marketing Dashboards
            <ChevronRight className="ml-2 h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Marketing Performance Dashboard • Data from executive_monthly_reports</p>
          <p className="mt-2 text-sm">December 2024 - August 2025</p>
        </div>
      </footer>
    </div>
  )
}