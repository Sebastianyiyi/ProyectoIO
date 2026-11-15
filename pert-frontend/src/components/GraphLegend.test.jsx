import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GraphLegend } from './GraphLegend'

describe('GraphLegend', () => {
  it('shows the dimmed state only in focus mode', () => {
    const { rerender } = render(<GraphLegend />)

    expect(screen.queryByText('Sin procesar')).not.toBeInTheDocument()

    rerender(<GraphLegend showDimmed />)

    expect(screen.getByText('Sin procesar')).toBeInTheDocument()
  })
})
