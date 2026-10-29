import {
  Loader2,
  Network,
  RefreshCw,
  Sparkles,
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

export function AppHeader({
  healthStatus,
  onRetryHealth,
  onLoadExample,
  loading,
}) {
  const health = HEALTH_STYLES[healthStatus] ?? HEALTH_STYLES.checking
  const HealthIcon = health.icon

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Network className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Investigación de Operaciones
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              PERT Lab
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${health.className}`}
          >
            <HealthIcon
              className={`size-3.5 ${health.spin ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {health.label}
          </span>

          {healthStatus === 'offline' ? (
            <button
              type="button"
              onClick={onRetryHealth}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Reintentar
            </button>
          ) : null}

          <button
            type="button"
            onClick={onLoadExample}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
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
