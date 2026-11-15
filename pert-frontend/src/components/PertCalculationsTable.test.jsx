import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PertCalculationsTable } from './PertCalculationsTable'

describe('PertCalculationsTable', () => {
  it('renders table columns and calculates total variance', () => {
    const result = {
      nodes: [
        { id: 'n1', event: 1, E: 0, L: 0 },
        { id: 'n2', event: 2, E: 4, L: 4 },
      ],
      activities: [
        {
          id: 'A',
          expected_time: 4,
          variance: 0.4444,
          slack: 0,
          is_critical: true,
          start_node_id: 'n1',
          end_node_id: 'n2',
        },
      ],
      probability: {
        critical_variance: 0.4444,
      },
    }

    render(<PertCalculationsTable result={result} />)

    expect(screen.getByText('te')).toBeInTheDocument()
    expect(screen.getByText('Ei')).toBeInTheDocument()
    expect(screen.getByText('Lj')).toBeInTheDocument()
    expect(screen.getAllByText(/Varianza/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Holgura/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('4,0').length).toBeGreaterThan(0)
  })
})
