export function calculateSavingsPercent(charged: number, fair: number): number {
  if (charged <= 0) return 0
  const savings = charged - fair
  return Math.max(0, Math.round((savings / charged) * 100))
}

export function scoreToLabel(score: number): 'Fair' | 'Moderate' | 'High Risk' | 'Overcharged' {
  if (score >= 80) return 'Fair'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'High Risk'
  return 'Overcharged'
}

export function scoreToColorClass(score: number): string {
  if (score >= 80) return 'text-success-600'
  if (score >= 60) return 'text-warning-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-danger-500'
}

export function lineItemStatusToColorClass(status: 'fair' | 'high' | 'overcharged'): string {
  const map: Record<string, string> = {
    fair: 'bg-success-50 text-success-600',
    high: 'bg-warning-50 text-warning-600',
    overcharged: 'bg-danger-50 text-danger-500',
  }
  return map[status] ?? ''
}
