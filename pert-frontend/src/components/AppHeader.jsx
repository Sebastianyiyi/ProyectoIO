import {
  CheckCircle2,
  GitBranch,
  LayoutGrid,
  ListOrdered,
  Loader2,
  Network,
  RefreshCw,
  Sparkles,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react'

const HEALTH_STYLES = {
  checking: {
    label: 'Conectando con la API',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Loader2,
    spin: true,
  },
  online: {
    label: 'API conectada',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: Wifi,
    spin: false,
  },
  offline: {
    label: 'API sin conexión',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: WifiOff,
    spin: false,
  },
}

const STEPS = [
  { id: 1, title: 'Configuración', icon: LayoutGrid },
  { id: 2, title: 'Red AOA y Datos', icon: GitBranch },
  { id: 3, title: 'Resultados y Probabilidad', icon: ListOrdered },
  { id: 4, title: 'Resumen Ejecutivo', icon: Trophy },
]

export function AppHeader({
  healthStatus,
  onRetryHealth,
  onLoadExample,
  loading,
  currentStep = 1,
  onStepChange = null,
  resultsAvailable = false,
}) {
  const health = HEALTH_STYLES[healthStatus] ?? HEALTH_STYLES.checking
  const HealthIcon = health.icon

  return (
    <header className="shrink-0 border-b border-slate-200/90 bg-white/95 backdrop-blur z-30">
      <div className="mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Network className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                Investigación de Operaciones
              </span>
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
              PERT Lab <span className="text-[11px] font-normal text-slate-400">Carousel</span>
            </h1>
          </div>
        </div>

        {/* 4-Step Wizard Carousel Stepper */}
        {onStepChange && (
          <nav
            aria-label="Pasos del asistente"
            className="hidden md:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner"
          >
            {STEPS.map((step) => {
              const isActive = currentStep === step.id
              const isPassed = resultsAvailable && currentStep > step.id
              const isClickable = step.id === 1 || resultsAvailable
              const StepIcon = step.icon

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => isClickable && onStepChange(step.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : isPassed
                        ? 'text-emerald-700 hover:text-emerald-900'
                        : isClickable
                          ? 'text-slate-500 hover:text-slate-800'
                          : 'cursor-not-allowed text-slate-400 opacity-50'
                  }`}
                >
                  <span
                    className={`grid size-4.5 place-items-center rounded-md text-[10px] font-black ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <StepIcon className="size-2.5" />
                    )}
                  </span>
                  <span>{step.title}</span>
                </button>
              )
            })}
          </nav>
        )}

        {/* Status & Actions */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${health.className}`}
          >
            <HealthIcon
              className={`size-3 ${health.spin ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {health.label}
          </span>

          {healthStatus === 'offline' ? (
            <button
              type="button"
              onClick={onRetryHealth}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="size-3" aria-hidden="true" />
              Reintentar
            </button>
          ) : null}

          <button
            type="button"
            onClick={onLoadExample}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-3.5" aria-hidden="true" />
            )}
            Cargar ejemplo
          </button>
        </div>
      </div>
    </header>
  )
}
