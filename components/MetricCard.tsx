'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCardProps } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

export function MetricCard({
  title,
  value,
  formatType,
  change,
  changeType = 'percent',
  trend,
  subtitle,
  isLoading = false,
  size = 'medium',
  showSparkline = false,
  sparklineData = []
}: MetricCardProps) {
  // Format the main value
  const formatValue = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    
    switch (formatType) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      case 'number':
        return formatNumber(val);
      default:
        return val.toString();
    }
  };

  // Format the change value
  const formatChange = (val: number) => {
    if (changeType === 'percent') {
      return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
    } else {
      return `${val > 0 ? '+' : ''}${formatValue(val)}`;
    }
  };

  // Determine trend colors and icons
  const getTrendInfo = () => {
    if (trend === 'up' || (change && change > 0)) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: TrendingUp
      };
    } else if (trend === 'down' || (change && change < 0)) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: TrendingDown
      };
    } else {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: Minus
      };
    }
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  // Size-based classes
  const sizeClasses = {
    small: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-xl',
      change: 'text-sm'
    },
    medium: {
      card: 'p-6',
      title: 'text-sm',
      value: 'text-2xl',
      change: 'text-sm'
    },
    large: {
      card: 'p-8',
      title: 'text-base',
      value: 'text-3xl',
      change: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${classes.card}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${classes.card}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`font-medium text-gray-600 ${classes.title}`}>
            {title}
          </p>
          <p className={`font-bold text-gray-900 mt-2 ${classes.value}`}>
            {formatValue(value)}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Trend indicator */}
        {(change !== undefined || trend) && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendInfo.bgColor}`}>
            <TrendIcon className={`w-3 h-3 ${trendInfo.color}`} />
            {change !== undefined && (
              <span className={`${classes.change} font-medium ${trendInfo.color}`}>
                {formatChange(change)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini sparkline */}
      {showSparkline && sparklineData.length > 0 && (
        <div className="mt-4 h-8">
          <MiniSparkline data={sparklineData} color={trendInfo.color} />
        </div>
      )}
    </div>
  );
}

// Mini sparkline component
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  if (range === 0) return null;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((max - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className={color}
          opacity="0.6"
        />
      </svg>
    </div>
  );
}