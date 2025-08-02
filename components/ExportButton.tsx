'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

interface ExportButtonProps {
  data: any[]
  filename: string
  columns?: {
    key: string
    label: string
    format?: 'currency' | 'percent' | 'number' | 'text'
  }[]
}

export function ExportButton({ data, filename, columns }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  function formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) return ''
    
    switch (format) {
      case 'currency':
        return formatCurrency(value).replace('$', '') // Remove $ for CSV
      case 'percent':
        return formatPercent(value).replace('%', '') // Remove % for CSV
      case 'number':
        return formatNumber(value).replace(/,/g, '') // Remove commas for CSV
      default:
        return String(value)
    }
  }

  function exportToCSV() {
    setIsExporting(true)
    
    try {
      let csv = ''
      
      if (columns) {
        // Use provided columns
        csv = columns.map(col => col.label).join(',') + '\n'
        csv += data.map(row => 
          columns.map(col => {
            const value = col.key.includes('.') 
              ? col.key.split('.').reduce((obj, key) => obj?.[key], row)
              : row[col.key]
            return `"${formatValue(value, col.format)}"`
          }).join(',')
        ).join('\n')
      } else {
        // Auto-generate from data
        const keys = Object.keys(data[0] || {})
        csv = keys.join(',') + '\n'
        csv += data.map(row => 
          keys.map(key => `"${formatValue(row[key])}"`).join(',')
        ).join('\n')
      }
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setShowMenu(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  function exportToJSON() {
    setIsExporting(true)
    
    try {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setShowMenu(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !data || data.length === 0}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
      
      {showMenu && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4" />
              Export as JSON
            </button>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}