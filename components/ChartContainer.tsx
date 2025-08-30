'use client';

import React from 'react';
import { ChevronDown, Download, Maximize2 } from 'lucide-react';
import { ChartContainerProps } from '@/types/dashboard';

export function ChartContainer({
  title,
  subtitle,
  height = 300,
  loading = false,
  error = null,
  children,
  className = '',
  actions
}: ChartContainerProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className="p-6" style={{ height }}>
          <div className="animate-pulse h-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className="p-6 flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-red-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Chart Error</h4>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="p-6" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

// Chart action buttons
export function ChartActions() {
  return (
    <div className="flex items-center gap-2">
      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
        <Download className="w-4 h-4" />
      </button>
      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}