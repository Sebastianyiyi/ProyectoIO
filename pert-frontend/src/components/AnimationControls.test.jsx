import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnimationControls } from './AnimationControls'

function renderControls(overrides = {}) {
  const handlers = {
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onTogglePlay: vi.fn(),
    onReset: vi.fn(),
    onGoToFinal: vi.fn(),
    onSpeedChange: vi.fn(),
    ...overrides,
  }

  render(
    <AnimationControls
      index={4}
      total={10}
      isPlaying={false}
      isFirst={false}
      isLast={false}
      speed={1}
      {...handlers}
    />,
  )

  return handlers
}

describe('AnimationControls', () => {
  it('shows the step counter and triggers playback actions', () => {
    const handlers = renderControls()

    expect(screen.getByText('5 de 10')).toBeInTheDocument()
    expect(screen.getByText('1x')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /paso anterior/i }))
    fireEvent.click(screen.getByRole('button', { name: /reproducir animación/i }))
    fireEvent.click(screen.getByRole('button', { name: /paso siguiente/i }))
    fireEvent.click(screen.getByRole('button', { name: /reiniciar animación/i }))
    fireEvent.click(screen.getByRole('button', { name: /resultado final/i }))

    expect(handlers.onPrev).toHaveBeenCalledTimes(1)
    expect(handlers.onTogglePlay).toHaveBeenCalledTimes(1)
    expect(handlers.onNext).toHaveBeenCalledTimes(1)
    expect(handlers.onReset).toHaveBeenCalledTimes(1)
    expect(handlers.onGoToFinal).toHaveBeenCalledTimes(1)
  })

  it('emits the selected animation speed', () => {
    const handlers = renderControls()
    const slider = screen.getByLabelText('Velocidad de animación')

    fireEvent.change(slider, { target: { value: '1.75' } })

    expect(handlers.onSpeedChange).toHaveBeenCalledWith(1.75)
  })
})
