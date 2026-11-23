import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProbabilityCard } from './ProbabilityCard'

const result = {
  probability: {
    mean: 11.5,
    standard_deviation: 1.7,
    target_time: 13,
    z_score: 0.88,
    probability: 0.8106,
    critical_variance: 2.89,
    formula: 'Z = (13 - 11.5) / 1.7',
    normal_formula: 'P(T ≤ 13) = Φ(0,88)',
  },
}

describe('ProbabilityCard', () => {
  it('highlights the probability and the Z calculation', () => {
    render(<ProbabilityCard result={result} />)

    const probability = screen.getByText('81,1%')
    expect(probability).toHaveClass('text-[32px]')
    expect(screen.getByText(/0,88/)).toBeInTheDocument()
    expect(screen.getByText(/11,5/)).toBeInTheDocument()
    expect(screen.getByText(/2,89/)).toBeInTheDocument()
    expect(screen.getByText(/1,7/)).toBeInTheDocument()
  })
})
