import { describe, expect, it } from 'vitest'
import {
  formatDecimal,
  formatDuration,
  formatLabelValue,
  formatNumber,
  formatProbability,
  formatStepValue,
} from './format'

describe('format helpers', () => {
  it('formats numbers with Spanish locale', () => {
    expect(formatNumber(11.234)).toBe('11,23')
    expect(formatNumber(0)).toBe('0')
  })

  it('returns a dash for empty or invalid values', () => {
    expect(formatNumber(null)).toBe('—')
    expect(formatNumber(undefined)).toBe('—')
    expect(formatNumber('')).toBe('—')
    expect(formatNumber('abc')).toBe('—')
  })

  it('formats durations, decimals and probabilities', () => {
    expect(formatDuration(11)).toBe('11,0')
    expect(formatDecimal(1.23456)).toBe('1,2346')
    expect(formatProbability(0.915666)).toBe('91.6%')
    expect(formatProbability(null)).toBe('—')
  })

  it('formats labels for the graph and step panel', () => {
    expect(formatLabelValue(0)).toBe('0')
    expect(formatStepValue('E', 0)).toBe('E = 0')
    expect(formatStepValue('L', null)).toBeNull()
  })
})
