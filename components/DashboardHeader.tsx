'use client'

import { Calendar, Download, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface DashboardHeaderProps {
  onCompanyFilter?: (company: string | null) => void
  onRefresh?: () => void
  onExport?: () => void
}

const companies = [
  { value: 'all', label: 'All Companies', shortLabel: 'All' },
  { value: 'advancedlifeclinic.com', label: 'Advanced Life Clinic', shortLabel: 'Advanced Life' },
  { value: 'alluraderm.com', label: 'Alluraderm', shortLabel: 'Alluraderm' },
  { value: 'bismarckbotox.com', label: 'Bismarck Botox', shortLabel: 'Bismarck' },
  { value: 'drridha.com', label: 'Dr. Ridha', shortLabel: 'Dr. Ridha' },
  { value: 'genesis-medspa.com', label: 'Genesis MedSpa', shortLabel: 'Genesis' },
  { value: 'greenspringaesthetics.com', label: 'Green Spring Aesthetics', shortLabel: 'Green Spring' },
  { value: 'kovakcosmeticcenter.com', label: 'Kovak Cosmetic Center', shortLabel: 'Kovak' },
  { value: 'mirabilemd.com', label: 'Mirabile MD', shortLabel: 'Mirabile' },
  { value: 'myskintastic.com', label: 'My Skintastic', shortLabel: 'Skintastic' },
  { value: 'skincareinstitute.net', label: 'Skincare Institute', shortLabel: 'Skincare Inst.' },
  { value: 'skinjectables.com', label: 'Skinjectables', shortLabel: 'Skinjectables' }
]

export function DashboardHeader({
  onCompanyFilter,
  onRefresh,
  onExport
}: DashboardHeaderProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value)
    onCompanyFilter?.(value === 'all' ? null : value)
  }
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and Date */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clinic Performance Report</h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-600">
                July 2025 Report (Full Month Data)
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {/* Export Button */}
            <button
              onClick={onExport}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-500">Companies:</span>
            <span className="font-semibold text-gray-900">11</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-500">Metrics:</span>
            <span className="font-semibold text-gray-900">28</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-500">Comparisons:</span>
            <span className="font-semibold text-gray-900">MoM & YoY</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-500">Data Type:</span>
            <span className="font-semibold text-gray-900">Actual & Trending</span>
          </div>
        </div>
      </div>
      
      {/* Company Filter Tabs */}
      <div className="border-t border-gray-200">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-medium text-gray-500 mr-2">Filter:</span>
            {companies.map((company) => (
              <button
                key={company.value}
                onClick={() => handleCompanyChange(company.value)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all
                  ${selectedCompany === company.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }
                `}
                title={company.label}
              >
                {company.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}