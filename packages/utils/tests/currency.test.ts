import { describe, it, expect } from 'vitest'
import { formatCurrency, formatSavings } from '../src/currency'

describe('formatCurrency', () => {
  it('formats INR by default', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('1,000')
  })

  it('formats USD', () => {
    const result = formatCurrency(1000, 'USD')
    expect(result).toContain('1,000')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBeTruthy()
  })
})

describe('formatSavings', () => {
  it('adds + prefix for positive savings', () => {
    expect(formatSavings(500)).toContain('+')
  })

  it('handles zero savings', () => {
    expect(formatSavings(0)).not.toContain('+')
  })
})
