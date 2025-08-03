'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3 } from 'lucide-react'

const COMPANIES = [
  { id: 'advancedlifeclinic.com', name: 'Advanced Life Clinic' },
  { id: 'alluraderm.com', name: 'Alluraderm' },
  { id: 'bismarckbotox.com', name: 'Bismarck Botox' },
  { id: 'drridha.com', name: 'Dr. Ridha' },
  { id: 'genesis-medspa.com', name: 'Genesis MedSpa' },
  { id: 'greenspringaesthetics.com', name: 'Greenspring Aesthetics' },
  { id: 'medicalagecenter.com', name: 'Medical Age Center' },
  { id: 'parkhillclinic.com', name: 'Parkhill Clinic' },
  { id: 'skincareinstitute.net', name: 'Skincare Institute' },
  { id: 'skinjectables.com', name: 'Skinjectables' },
  { id: 'youthful-image.com', name: 'Youthful Image' }
]

export default function MarketingDashboardList() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketing Performance Dashboards
          </h1>
          <p className="text-lg text-gray-600">
            Select a company to view their marketing channel performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPANIES.map((company) => (
            <Link 
              key={company.id} 
              href={`/marketing/${company.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{company.name}</span>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {company.id}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Dec 2024 - Aug 2025</span>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Data sourced from executive_monthly_reports table
          </p>
        </div>
      </div>
    </div>
  )
}