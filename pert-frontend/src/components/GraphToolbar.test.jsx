import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GraphToolbar } from './GraphToolbar'

describe('GraphToolbar', () => {
  it('triggers zoom and fit actions', () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onFit = vi.fn()

    render(
      <GraphToolbar
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFit={onFit}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /acercar zoom/i }))
    fireEvent.click(screen.getByRole('button', { name: /alejar zoom/i }))
    fireEvent.click(screen.getByRole('button', { name: /ajustar red/i }))

    expect(onZoomIn).toHaveBeenCalledTimes(1)
    expect(onZoomOut).toHaveBeenCalledTimes(1)
    expect(onFit).toHaveBeenCalledTimes(1)
  })
})
