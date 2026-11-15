import { Route } from 'lucide-react'

function formatDays(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2) : '—'
}

export function CriticalPathSummary({ result }) {
  const criticalPath = result?.critical_path ?? []

  if (!result) {
    return null
  }

  return (
    <section
      aria-label="Resumen de ruta crítica"
      className="rounded-2xl border border-amber-200/80 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-md"
    >
      <div className="flex items-center gap-1.5 text-amber-700">
        <Route className="size-3.5" aria-hidden="true" />
        <span className="text-[9px] font-black uppercase tracking-wide">
          Ruta crítica
        </span>
      </div>

      {criticalPath.length > 0 ? (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {criticalPath.map((activityId, index) => (
            <span key={`${activityId}-${index}`} className="contents">
              {index > 0 ? (
                <span className="text-[10px] font-black text-amber-500">
                  →
                </span>
              ) : null}
              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-800 ring-1 ring-inset ring-amber-200">
                {activityId}
              </span>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[10px] font-semibold text-amber-700">
          Sin ruta crítica
        </p>
      )}

      <p className="mt-1 font-mono text-[10px] font-bold text-slate-600">
        Duración total:{' '}
        <span className="text-slate-900">{formatDays(result.project_duration)} días</span>
      </p>
    </section>
  )
}
