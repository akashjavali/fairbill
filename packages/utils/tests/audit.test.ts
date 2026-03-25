import { describe, it, expect } from 'vitest'
import { calculateSavingsPercent, scoreToLabel } from '../src/audit'

describe('calculateSavingsPercent', () => {
  it('calculates correct percentage', () => {
    expect(calculateSavingsPercent(1000, 800)).toBe(20)
  })

  it('returns 0 for no savings', () => {
    expect(calculateSavingsPercent(1000, 1000)).toBe(0)
  })

  it('returns 0 for zero charged amount', () => {
    expect(calculateSavingsPercent(0, 0)).toBe(0)
  })

  it('returns 0 when fair > charged', () => {
    expect(calculateSavingsPercent(800, 1000)).toBe(0)
  })
})

describe('scoreToLabel', () => {
  it('returns Fair for score >= 80', () => {
    expect(scoreToLabel(85)).toBe('Fair')
    expect(scoreToLabel(80)).toBe('Fair')
  })

  it('returns Moderate for score 60-79', () => {
    expect(scoreToLabel(70)).toBe('Moderate')
  })

  it('returns High Risk for score 40-59', () => {
    expect(scoreToLabel(50)).toBe('High Risk')
  })

  it('returns Overcharged for score < 40', () => {
    expect(scoreToLabel(30)).toBe('Overcharged')
  })
})
