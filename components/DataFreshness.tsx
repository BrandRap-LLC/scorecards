'use client'

import { CheckCircle } from 'lucide-react'

export function DataFreshness() {
  // Get current date
  const currentDate = new Date()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const month = monthNames[currentDate.getMonth()]
  const day = currentDate.getDate()
  const year = currentDate.getFullYear()
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <div className="text-sm">
        <span className="font-medium text-green-600">
          Data current through {month} {day}, {year}
        </span>
      </div>
    </div>
  )
}