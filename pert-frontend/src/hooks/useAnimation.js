import { useCallback, useEffect, useState } from 'react'

export function useAnimation(stepCount, intervalMs = 1100) {
  const lastIndex = Math.max(0, stepCount - 1)
  const [rawIndex, setRawIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const index = Math.min(rawIndex, lastIndex)

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const next = useCallback(() => {
    setIsPlaying(false)
    setRawIndex((current) =>
      Math.min(Math.min(current, lastIndex) + 1, lastIndex),
    )
  }, [lastIndex])

  const prev = useCallback(() => {
    setIsPlaying(false)
    setRawIndex((current) =>
      Math.max(Math.min(current, lastIndex) - 1, 0),
    )
  }, [lastIndex])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setRawIndex(0)
  }, [])

  const goToFinal = useCallback(() => {
    setIsPlaying(false)
    setRawIndex(lastIndex)
  }, [lastIndex])

  const play = useCallback(() => {
    if (stepCount <= 1) {
      return
    }

    setRawIndex((current) =>
      Math.min(current, lastIndex) >= lastIndex ? 0 : current,
    )
    setIsPlaying(true)
  }, [lastIndex, stepCount])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, pause, play])

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    if (index >= lastIndex) {
      const stopTimer = setTimeout(() => setIsPlaying(false), 0)
      return () => clearTimeout(stopTimer)
    }

    const timer = setTimeout(() => {
      const nextIndex = Math.min(index + 1, lastIndex)
      setRawIndex(nextIndex)

      if (nextIndex >= lastIndex) {
        setIsPlaying(false)
      }
    }, intervalMs)

    return () => clearTimeout(timer)
  }, [index, intervalMs, isPlaying, lastIndex])

  return {
    index,
    isPlaying: isPlaying && index < lastIndex,
    isFirst: index === 0,
    isLast: index >= lastIndex,
    lastIndex,
    next,
    prev,
    play,
    pause,
    togglePlay,
    reset,
    goToFinal,
  }
}
