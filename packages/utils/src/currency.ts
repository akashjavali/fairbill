export function formatCurrency(amount: number, currency = 'INR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatSavings(amount: number, currency = 'INR'): string {
  if (amount <= 0) return formatCurrency(0, currency)
  return `+${formatCurrency(amount, currency)}`
}
