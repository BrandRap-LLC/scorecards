'use client'

import { CheckCircle } from 'lucide-react'

export function DataFreshness() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <div className="text-sm">
        <span className="font-medium text-green-600">
          Data current through August 2025
        </span>
      </div>
    </div>
  )
}