'use client'

import React from 'react'
import { HEATMAP_LEGEND } from '@/lib/heatmap'

interface HeatmapLegendProps {
  showInverted?: boolean
  className?: string
}

export default function HeatmapLegend({ showInverted = false, className = '' }: HeatmapLegendProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 ${className}`}>
      <h3 className="text-xs font-semibold text-gray-700 mb-2">
        Performance Heatmap
      </h3>
      
      <div className="space-y-3">
        {/* Normal Metrics Scale */}
        <div>
          <p className="text-xs text-gray-600 mb-1.5">Standard Metrics (higher is better):</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-1">
            {HEATMAP_LEGEND.normal.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color} rounded border border-gray-200`}></div>
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 sm:ml-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 ${HEATMAP_LEGEND.null.color} rounded border border-gray-200`}></div>
              <span className="text-xs text-gray-600">{HEATMAP_LEGEND.null.label}</span>
            </div>
          </div>
        </div>
        
        {/* Inverted Metrics Scale */}
        {showInverted && (
          <div>
            <p className="text-xs text-gray-600 mb-1.5">Cost Metrics (lower is better):</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-1">
              {HEATMAP_LEGEND.inverted.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color} rounded border border-gray-200`}></div>
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2 italic hidden sm:block">
        Colors show relative performance within each metric
      </p>
    </div>
  )
}