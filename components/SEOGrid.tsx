'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { SeoChannelsRecord } from '@/lib/api-paid-seo';

interface SEOGridProps {
  clinic?: string;
  startDate?: string;
  endDate?: string;
}

export default function SEOGrid({ clinic, startDate, endDate }: SEOGridProps) {
  const [data, setData] = useState<SeoChannelsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [clinic, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (clinic) params.append('clinic', clinic);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/seo-channels?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading SEO data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No SEO data available</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
              Clinic
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Traffic Source
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Impressions
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Visits
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              CTR
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Appts
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              New Appts
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Return Appts
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Appt Rev
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Est Revenue
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              6M Revenue
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Conv
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              New Conv
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Return Conv
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conv Rate
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Appt Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                {record.clinic}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(record.month), 'MMM yyyy')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {record.traffic_source}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.impressions !== null ? formatNumber(record.impressions) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.visits !== null ? formatNumber(record.visits) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.ctr !== null ? formatPercent(record.ctr) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.total_appointments !== null ? formatNumber(record.total_appointments) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.new_appointments !== null ? formatNumber(record.new_appointments) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.returning_appointments !== null ? formatNumber(record.returning_appointments) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.avg_appointment_rev !== null ? formatCurrency(record.avg_appointment_rev) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.appointment_est_revenue !== null ? formatCurrency(record.appointment_est_revenue) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.new_appointment_est_6m_revenue !== null ? formatCurrency(record.new_appointment_est_6m_revenue) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.total_conversations !== null ? formatNumber(record.total_conversations) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.new_conversations !== null ? formatNumber(record.new_conversations) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.returning_conversations !== null ? formatNumber(record.returning_conversations) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.conversation_rate !== null ? formatPercent(record.conversation_rate) : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                {record.appointment_rate !== null ? formatPercent(record.appointment_rate) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}