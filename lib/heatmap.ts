// Heatmap color configuration and utilities

// Normal metrics (higher values = better performance)
const NORMAL_COLORS = {
  5: 'bg-green-100',     // Top 20% (80-100 percentile) - Best
  4: 'bg-green-50',      // 60-80 percentile - Good  
  3: 'bg-yellow-50',     // 40-60 percentile - Average
  2: 'bg-orange-50',     // 20-40 percentile - Below Average
  1: 'bg-red-50',        // Bottom 20% (0-20 percentile) - Worst
} as const

// Inverted metrics (lower values = better performance)
const INVERTED_COLORS = {
  5: 'bg-red-50',        // Top 20% (high values = bad performance)
  4: 'bg-orange-50',     // 60-80 percentile
  3: 'bg-yellow-50',     // 40-60 percentile - Average
  2: 'bg-green-50',      // 20-40 percentile  
  1: 'bg-green-100',     // Bottom 20% (low values = good performance)
} as const

// Null/missing values
const NULL_COLOR = 'bg-gray-50'

// Inverted metrics - these metrics where lower values are better
const INVERTED_METRICS = [
  // Cost metrics
  'cost_per_lead',
  'cost_per_appt',
  'cost_per_appointment',
  'cac_total',
  'cac_new',
  'spend',
  
  // Efficiency metrics that should be minimized
  'pct_sale_discount',
  'discount_percentage',
  
  // Add any other metrics where lower is better
] as const

// Helper function to calculate percentile
function getPercentile(value: number, values: number[]): number {
  if (values.length === 0) return 50
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = sorted.indexOf(value)
  
  // Handle duplicate values by finding the last occurrence
  let lastIndex = index
  while (lastIndex < sorted.length - 1 && sorted[lastIndex + 1] === value) {
    lastIndex++
  }
  
  // Use the midpoint for duplicate values
  const effectiveIndex = (index + lastIndex) / 2
  
  return (effectiveIndex / (sorted.length - 1)) * 100
}

// Main function to get heatmap colors
export function getHeatmapColor(
  value: number | null | undefined,
  allValues: (number | null | undefined)[],
  metricCode?: string
): { bgColor: string; textColor: string } {
  
  // 1. Handle null/undefined values
  if (value === null || value === undefined) {
    return {
      bgColor: NULL_COLOR,
      textColor: 'text-gray-500',
    }
  }

  // 2. Filter out null values for calculation
  const validValues = allValues.filter((v): v is number => 
    v !== null && v !== undefined && !isNaN(v)
  )
  
  if (validValues.length === 0) {
    return {
      bgColor: NULL_COLOR,
      textColor: 'text-gray-500',
    }
  }

  // 3. If all values are the same, return neutral color
  const uniqueValues = new Set(validValues)
  if (uniqueValues.size === 1) {
    return {
      bgColor: 'bg-yellow-50',
      textColor: 'text-gray-900',
    }
  }

  // 4. Calculate percentile
  const percentile = getPercentile(value, validValues)
  
  // 5. Determine if metric is inverted
  const isInverted = metricCode ? 
    INVERTED_METRICS.some(metric => 
      metricCode.toLowerCase().includes(metric.toLowerCase())
    ) : false
  
  const colorScale = isInverted ? INVERTED_COLORS : NORMAL_COLORS
  
  // 6. Assign color level based on percentile
  let level: keyof typeof NORMAL_COLORS
  if (percentile >= 80) level = 5      // Top 20%
  else if (percentile >= 60) level = 4  // 60-80%
  else if (percentile >= 40) level = 3  // 40-60%
  else if (percentile >= 20) level = 2  // 20-40%
  else level = 1                        // Bottom 20%
  
  return {
    bgColor: colorScale[level],
    textColor: 'text-gray-900', // Always dark text for subtle colors
  }
}

// Function to check if a metric should use inverted colors
export function isInvertedMetric(metricCode?: string): boolean {
  if (!metricCode) return false
  
  return INVERTED_METRICS.some(metric => 
    metricCode.toLowerCase().includes(metric.toLowerCase())
  )
}

// Export color scales for legend component
export const HEATMAP_LEGEND = {
  normal: [
    { color: 'bg-green-100', label: 'Best' },
    { color: 'bg-green-50', label: 'Good' },
    { color: 'bg-yellow-50', label: 'Average' },
    { color: 'bg-orange-50', label: 'Below' },
    { color: 'bg-red-50', label: 'Worst' },
  ],
  inverted: [
    { color: 'bg-green-100', label: 'Best' },
    { color: 'bg-green-50', label: 'Good' },
    { color: 'bg-yellow-50', label: 'Average' },
    { color: 'bg-orange-50', label: 'Below' },
    { color: 'bg-red-50', label: 'Worst' },
  ],
  null: { color: NULL_COLOR, label: 'No Data' }
}