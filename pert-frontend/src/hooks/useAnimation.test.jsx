import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAnimation } from './useAnimation'

describe('useAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at the first step and navigates manually', () => {
    const { result } = renderHook(() => useAnimation(5, 1000))

    expect(result.current.index).toBe(0)
    expect(result.current.isFirst).toBe(true)

    act(() => result.current.next())
    expect(result.current.index).toBe(1)

    act(() => result.current.prev())
    expect(result.current.index).toBe(0)
  })

  it('plays until the last step and stops automatically', () => {
    const { result } = renderHook(() => useAnimation(3, 1000))

    act(() => result.current.play())
    expect(result.current.isPlaying).toBe(true)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(1)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(2)
    expect(result.current.isPlaying).toBe(false)
  })

  it('restarts from the beginning when playing from the last step', () => {
    const { result } = renderHook(() => useAnimation(3, 1000))

    act(() => result.current.goToFinal())
    expect(result.current.index).toBe(2)

    act(() => result.current.play())
    expect(result.current.index).toBe(0)
    expect(result.current.isPlaying).toBe(true)
  })

  it('resets and clamps when the step count changes', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useAnimation(count, 1000),
      { initialProps: { count: 5 } },
    )

    act(() => result.current.goToFinal())
    expect(result.current.index).toBe(4)

    rerender({ count: 2 })
    expect(result.current.index).toBe(1)
    expect(result.current.isPlaying).toBe(false)

    act(() => result.current.reset())
    expect(result.current.index).toBe(0)
  })
})
