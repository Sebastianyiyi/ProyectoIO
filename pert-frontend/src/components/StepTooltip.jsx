import { useEffect, useRef, useState } from 'react'
import {
  STEP_TOOLTIP_FADE_MS,
  STEP_TOOLTIP_HOLD_MS,
  STEP_TOOLTIP_TYPING_MS,
  STEP_TYPES,
} from '../lib/constants'

export function StepTooltip({ narration, stepKey, speed = 1, anchor, onSettled }) {
  const formula = narration?.formula ?? ''
  const safeSpeed = Math.max(Number(speed) || 1, 0.1)
  const fadeMs = STEP_TOOLTIP_FADE_MS / safeSpeed
  const [visibleChars, setVisibleChars] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const settledRef = useRef(onSettled)

  useEffect(() => {
    settledRef.current = onSettled
  })

  useEffect(() => {
    if (!formula) {
      return undefined
    }

    const typingMs = STEP_TOOLTIP_TYPING_MS / safeSpeed
    const holdMs = STEP_TOOLTIP_HOLD_MS / safeSpeed
    const charDelay = Math.max(8, typingMs / Math.max(formula.length, 1))
    let current = 0

    const typingTimer = window.setInterval(() => {
      current += 1
      setVisibleChars(current)
      if (current >= formula.length) {
        window.clearInterval(typingTimer)
      }
    }, charDelay)

    const fadeTimer = window.setTimeout(
      () => setIsFading(true),
      Math.max(holdMs, typingMs + fadeMs),
    )
    const hideTimer = window.setTimeout(() => {
      setIsHidden(true)
      settledRef.current?.()
    }, Math.max(holdMs, typingMs + fadeMs) + fadeMs)

    return () => {
      window.clearInterval(typingTimer)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [fadeMs, formula, safeSpeed, stepKey])

  if (!narration || !anchor || isHidden) {
    return null
  }

  const meta = STEP_TYPES[narration.type] ?? STEP_TYPES.forward
  const isAbove = anchor.placement !== 'below'

  return (
    <div
      className="pointer-events-none absolute z-20 w-[min(340px,calc(100vw-2rem))]"
      style={{
        left: anchor.x,
        top: anchor.y,
        transform: isAbove
          ? 'translate(-50%, -100%)'
          : 'translate(-50%, 0)',
      }}
      role="status"
      aria-live="polite"
      aria-label={formula}
    >
      <div
        className="relative rounded-2xl border border-white/10 bg-slate-900/90 p-3 text-white shadow-2xl shadow-slate-900/25 backdrop-blur-md transition-opacity ease-out"
        style={{ opacity: isFading ? 0 : 1, transitionDuration: `${fadeMs}ms` }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-200">
            <span className="size-1.5 rounded-full bg-sky-400" />
            {meta.label}
          </span>
          <span className="text-[10px] font-semibold text-slate-300">
            Evento {narration.nodeEvent ?? '—'}
          </span>
        </div>

        <p className="mt-2 min-h-10 whitespace-pre-wrap break-words font-mono text-[12.5px] font-bold leading-5 text-white">
          <span aria-hidden="true">
            {formula.slice(0, visibleChars)}
            {visibleChars < formula.length ? (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-sky-300 align-[-2px]" />
            ) : null}
          </span>
        </p>

        <span
          className={`absolute left-1/2 size-2 -translate-x-1/2 rotate-45 border-white/10 bg-slate-900/90 ${
            isAbove ? '-bottom-1 border-b border-r' : '-top-1 border-l border-t'
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
