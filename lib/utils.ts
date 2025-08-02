export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A'
  // Multiply by 100 since percentages are stored as decimals (e.g., 0.85 for 85%)
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatChange(value: number | null | undefined, isPercent: boolean = false): {
  text: string
  color: string
  icon: 'up' | 'down' | 'neutral'
} {
  if (value === null || value === undefined) {
    return { text: 'N/A', color: 'text-gray-500', icon: 'neutral' }
  }

  // For percentages, multiply by 100 since they're stored as decimals
  const formattedValue = isPercent ? `${(value * 100).toFixed(2)}%` : formatNumber(value)
  
  if (value > 5) {
    return { text: `+${formattedValue}`, color: 'text-green-600', icon: 'up' }
  } else if (value < -5) {
    return { text: formattedValue, color: 'text-red-600', icon: 'down' }
  } else {
    return { text: formattedValue, color: 'text-gray-600', icon: 'neutral' }
  }
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || ''
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}