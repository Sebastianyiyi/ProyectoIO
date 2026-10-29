import {
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react'

function ControlButton({ label, onClick, disabled, children, variant = 'ghost' }) {
  const styles =
    variant === 'primary'
      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-500'
      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
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
  onPrev,
  onNext,
  onTogglePlay,
  onReset,
  onGoToFinal,
}) {
  const disabled = total === 0
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[130px] flex-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-400">
            <span>Animación</span>
            <span>
              {total > 0 ? `${index + 1} / ${total}` : '0 / 0'}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ControlButton label="Reiniciar animación" onClick={onReset} disabled={disabled || (isFirst && !isPlaying)}>
            <RotateCcw className="size-4" aria-hidden="true" />
          </ControlButton>
          <ControlButton label="Paso anterior" onClick={onPrev} disabled={disabled || isFirst}>
            <SkipBack className="size-4" aria-hidden="true" />
          </ControlButton>
          <ControlButton
            label={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
            onClick={onTogglePlay}
            disabled={disabled || total <= 1}
            variant="primary"
          >
            {isPlaying ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
          </ControlButton>
          <ControlButton label="Paso siguiente" onClick={onNext} disabled={disabled || isLast}>
            <SkipForward className="size-4" aria-hidden="true" />
          </ControlButton>
          <ControlButton label="Ir al resultado final" onClick={onGoToFinal} disabled={disabled || isLast}>
            <ChevronsRight className="size-4" aria-hidden="true" />
          </ControlButton>
        </div>
      </div>
    </div>
  )
}
