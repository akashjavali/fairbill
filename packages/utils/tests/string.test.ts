import { describe, it, expect } from 'vitest'
import { truncateText, generatePublicToken, toTitleCase } from '../src/string'

describe('truncateText', () => {
  it('truncates long text', () => {
    const result = truncateText('Hello World This Is Long', 10)
    expect(result).toBe('Hello W...')
    expect(result.length).toBe(10)
  })

  it('does not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello')
  })
})

describe('generatePublicToken', () => {
  it('generates a 32-char hex string', () => {
    const token = generatePublicToken()
    expect(token).toHaveLength(32)
    expect(token).toMatch(/^[a-f0-9]+$/)
  })

  it('generates unique tokens', () => {
    expect(generatePublicToken()).not.toBe(generatePublicToken())
  })
})

describe('toTitleCase', () => {
  it('converts snake_case', () => {
    expect(toTitleCase('home_repair')).toBe('Home Repair')
  })

  it('converts kebab-case', () => {
    expect(toTitleCase('home-repair')).toBe('Home Repair')
  })
})
