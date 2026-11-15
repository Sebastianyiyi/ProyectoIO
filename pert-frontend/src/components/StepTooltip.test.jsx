import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StepTooltip } from './StepTooltip'

const narration = { type: 'forward', nodeEvent: 1, formula: 'E₁ = 0' }

describe('StepTooltip', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes the formula, holds it, and notifies when it fades', () => {
    vi.useFakeTimers()
    const onSettled = vi.fn()

    render(
      <StepTooltip
        narration={narration}
        stepKey="0-forward-n1"
        speed={1}
        anchor={{ x: 200, y: 160, placement: 'above' }}
        onSettled={onSettled}
      />,
    )

    expect(
      screen.getByRole('status', { name: 'E₁ = 0' }),
    ).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(onSettled).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('scales the hold time with the animation speed', () => {
    vi.useFakeTimers()
    const onSettled = vi.fn()

    render(
      <StepTooltip
        narration={narration}
        stepKey="0-forward-n1"
        speed={2}
        anchor={{ x: 200, y: 160, placement: 'below' }}
        onSettled={onSettled}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1400)
    })

    expect(onSettled).toHaveBeenCalledTimes(1)
  })
})
