import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActivitiesTable } from './ActivitiesTable'

const result = {
  nodes: [
    { id: 'n1', event: 1, E: 0, L: 0 },
    { id: 'n2', event: 2, E: 2, L: 5 },
    { id: 'n3', event: 3, E: 5, L: 5 },
  ],
  activities: [
    {
      id: 'A',
      name: 'Actividad A',
      expected_time: 2,
      variance: 0.1111,
      slack: 0,
      is_critical: true,
      start_node_id: 'n1',
      end_node_id: 'n2',
      expected_time_formula: 'te(A) = 2',
      variance_formula: 'Var(A) = 0.1111',
      slack_formula: 'H(A) = 0',
    },
    {
      id: 'B',
      name: 'Actividad B',
      expected_time: 3,
      variance: 0.2222,
      slack: 1,
      is_critical: false,
      start_node_id: 'n2',
      end_node_id: 'n3',
      expected_time_formula: 'te(B) = 3',
      variance_formula: 'Var(B) = 0.2222',
      slack_formula: 'H(B) = 1',
    },
  ],
  probability: {
    critical_variance: 0.3333,
    target_time: 13,
    mean: 11,
  },
}

describe('ActivitiesTable', () => {
  it('shows event times and the critical-variance footer', () => {
    render(<ActivitiesTable result={result} />)

    expect(screen.getByText('Actividad')).toBeInTheDocument()
    expect(screen.getByText('Varianza (σ²)')).toBeInTheDocument()
    expect(screen.getByText('Holgura (H)')).toBeInTheDocument()
    expect(screen.getByText('Ei')).toBeInTheDocument()
    expect(screen.getByText('Lj')).toBeInTheDocument()
    expect(screen.getByText('Σ σ² (Ruta Crítica)')).toBeInTheDocument()
    expect(screen.getByText('0,3333')).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'Z = (T − T_E) / √(Σ σ² de la ruta crítica)',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/T = 13,0 · T_E = 11,0/)).toBeInTheDocument()
  })
})
