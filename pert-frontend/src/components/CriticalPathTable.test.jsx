import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CriticalPathTable } from './CriticalPathTable'

describe('CriticalPathTable', () => {
  it('renders critical activities with name and te', () => {
    const result = {
      project_duration: 10,
      nodes: [
        { id: 'n1', event: 1, E: 0, L: 0 },
        { id: 'n2', event: 2, E: 10, L: 10 },
      ],
      activities: [
        {
          id: 'A',
          name: 'Fase Inicial',
          expected_time: 10,
          variance: 1,
          slack: 0,
          is_critical: true,
          start_node_id: 'n1',
          end_node_id: 'n2',
        },
      ],
      critical_path: ['A'],
    }

    render(<CriticalPathTable result={result} />)

    expect(screen.getByText('Ruta Crítica')).toBeInTheDocument()
    expect(screen.getByText('Fase Inicial')).toBeInTheDocument()
    expect(screen.getAllByText('10,0').length).toBeGreaterThan(0)
  })
})
