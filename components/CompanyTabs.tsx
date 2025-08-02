'use client'

import { useState } from 'react'
import { Company } from '@/types/database'
import { Building2 } from 'lucide-react'

interface CompanyTabsProps {
  companies: Company[]
  selectedCompany: number | null
  onCompanyChange: (companyId: number | null) => void
}

export function CompanyTabs({ companies, selectedCompany, onCompanyChange }: CompanyTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => onCompanyChange(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCompany === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          All Companies
        </button>
        
        <div className="h-6 w-px bg-gray-300" />
        
        {companies.map((company) => (
          <button
            key={company.id}
            onClick={() => onCompanyChange(company.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCompany === company.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {company.display_name}
          </button>
        ))}
      </div>
    </div>
  )
}