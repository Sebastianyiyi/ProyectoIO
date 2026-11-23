import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CriticalPathSummary } from './CriticalPathSummary'

describe('CriticalPathSummary', () => {
  it('shows the critical path chips and total duration', () => {
    render(
      <CriticalPathSummary
        result={{
          project_duration: 11,
          critical_path: ['A', 'B', 'E', 'F'],
        }}
      />,
    )

    expect(screen.getByText('Ruta crítica')).toBeInTheDocument()
    for (const activityId of ['A', 'B', 'E', 'F']) {
      expect(screen.getByText(activityId)).toBeInTheDocument()
    }
    expect(screen.getByText(/Duración total:/)).toBeInTheDocument()
    expect(screen.getByText('11.00 días')).toBeInTheDocument()
  })

  it('renders nothing without a result', () => {
    const { container } = render(<CriticalPathSummary result={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
