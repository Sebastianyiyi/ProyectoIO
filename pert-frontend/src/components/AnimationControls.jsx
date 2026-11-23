import {
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import {
  ANIMATION_SPEED_MAX,
  ANIMATION_SPEED_MIN,
  ANIMATION_SPEED_STEP,
} from '../lib/constants'

function formatSpeed(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, '')
}

function ControlButton({ label, onClick, disabled, children, variant = 'ghost' }) {
  const styles =
    variant === 'primary'
      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-500'
      : 'border border-slate-200/80 bg-white/90 text-slate-600 hover:bg-white'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex size-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  )
}

export function AnimationControls({
  index,
  total,
  isPlaying,
  isFirst,
  isLast,
  speed = 1,
  onSpeedChange,
  onPrev,
  onNext,
  onTogglePlay,
  onReset,
  onGoToFinal,
}) {
  const disabled = total === 0
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-2.5 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="min-w-[112px] flex-1">
          <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-wide text-slate-400">
            <span>Paso</span>
            <span>
              {total > 0 ? `${index + 1} de ${total}` : '0 de 0'}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ControlButton
            label="Reiniciar animación"
            onClick={onReset}
            disabled={disabled || (isFirst && !isPlaying)}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </ControlButton>
          <ControlButton
            label="Paso anterior"
            onClick={onPrev}
            disabled={disabled || isFirst}
          >
            <SkipBack className="size-3.5" aria-hidden="true" />
          </ControlButton>
          <ControlButton
            label={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
            onClick={onTogglePlay}
            disabled={disabled || total <= 1}
            variant="primary"
          >
            {isPlaying ? (
              <Pause className="size-3.5" aria-hidden="true" />
            ) : (
              <Play className="size-3.5" aria-hidden="true" />
            )}
          </ControlButton>
          <ControlButton
            label="Paso siguiente"
            onClick={onNext}
            disabled={disabled || isLast}
          >
            <SkipForward className="size-3.5" aria-hidden="true" />
          </ControlButton>
          <ControlButton
            label="Ir al resultado final"
            onClick={onGoToFinal}
            disabled={disabled || isLast}
          >
            <ChevronsRight className="size-3.5" aria-hidden="true" />
          </ControlButton>
        </div>
      </div>

      <label className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-400">
        <span className="shrink-0">Velocidad</span>
        <input
          type="range"
          min={ANIMATION_SPEED_MIN}
          max={ANIMATION_SPEED_MAX}
          step={ANIMATION_SPEED_STEP}
          value={speed}
          onChange={(event) => onSpeedChange?.(Number(event.target.value))}
          disabled={disabled}
          aria-label="Velocidad de animación"
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
        />
        <span className="w-8 shrink-0 text-right font-mono text-[10px] text-slate-500">
          {formatSpeed(speed)}x
        </span>
      </label>
    </div>
  )
}
