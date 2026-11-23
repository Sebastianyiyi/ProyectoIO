import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectSummary } from './ProjectSummary'

const result = {
  project_duration: 11,
  critical_path: ['A', 'B'],
  critical_activities: ['A', 'B'],
  activities: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
  probability: {
    probability: 0.9157,
    standard_deviation: 1.29,
  },
}

describe('ProjectSummary', () => {
  it('keeps probability metrics out of the summary widget', () => {
    render(<ProjectSummary result={result} />)

    expect(screen.getByText('Duración')).toBeInTheDocument()
    expect(screen.getByText('Críticas')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(screen.queryByText('Ruta crítica')).not.toBeInTheDocument()
    expect(screen.queryByText('Probabilidad')).not.toBeInTheDocument()
    expect(screen.queryByText('Desviación σ')).not.toBeInTheDocument()
  })
})
