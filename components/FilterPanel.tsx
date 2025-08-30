'use client';

import React, { useState } from 'react';
import { Calendar, Building2, Globe, ChevronDown, X } from 'lucide-react';
import { FilterPanelProps } from '@/types/dashboard';

export function FilterPanel({
  filters,
  onChange,
  availableCompanies,
  availableTrafficSources,
  dateRange,
  className = ''
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCompanyChange = (company: string, checked: boolean) => {
    const newCompanies = checked
      ? [...filters.companies, company]
      : filters.companies.filter(c => c !== company);
    
    onChange({ ...filters, companies: newCompanies });
  };

  const handleTrafficSourceChange = (source: string, checked: boolean) => {
    const newSources = checked
      ? [...filters.trafficSources, source]
      : filters.trafficSources.filter(s => s !== source);
    
    onChange({ ...filters, trafficSources: newSources });
  };

  const clearAllFilters = () => {
    onChange({
      companies: [],
      startDate: dateRange.min,
      endDate: dateRange.max,
      trafficSources: [],
      period: 'monthly'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.companies.length > 0) count++;
    if (filters.trafficSources.length > 0) count++;
    if (filters.startDate !== dateRange.min || filters.endDate !== dateRange.max) count++;
    if (filters.period !== 'monthly') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`relative ${className}`}>
      {/* Filter trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
      >
        <Globe className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value="monthly"
                    checked={filters.period === 'monthly'}
                    onChange={(e) => onChange({ ...filters, period: 'monthly' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Monthly</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value="weekly"
                    checked={filters.period === 'weekly'}
                    onChange={(e) => onChange({ ...filters, period: 'weekly' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Weekly</span>
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    min={dateRange.min}
                    max={dateRange.max}
                    onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    min={dateRange.min}
                    max={dateRange.max}
                    onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Companies ({filters.companies.length} selected)
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.companies.length === availableCompanies.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange({ ...filters, companies: [...availableCompanies] });
                      } else {
                        onChange({ ...filters, companies: [] });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">All Companies</span>
                </label>
                <hr className="my-2" />
                {availableCompanies.map((company) => (
                  <label key={company} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.companies.includes(company)}
                      onChange={(e) => handleCompanyChange(company, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{company}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Traffic Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Traffic Sources ({filters.trafficSources.length} selected)
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.trafficSources.length === availableTrafficSources.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange({ ...filters, trafficSources: [...availableTrafficSources] });
                      } else {
                        onChange({ ...filters, trafficSources: [] });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">All Sources</span>
                </label>
                <hr className="my-2" />
                {availableTrafficSources.map((source) => (
                  <label key={source} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.trafficSources.includes(source)}
                      onChange={(e) => handleTrafficSourceChange(source, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{source}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}