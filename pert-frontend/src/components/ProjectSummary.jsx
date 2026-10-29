import { Clock, GitBranch, Route, Sigma } from 'lucide-react'
import { formatDecimal, formatDuration } from '../lib/format'

function StatCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className={`size-3.5 ${tone}`} aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function ProjectSummary({ result }) {
  const criticalPath = result.critical_path ?? []
  const probability = result.probability?.probability

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Resumen
        </h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-100">
          Resuelto
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={Clock}
          label="Duración"
          value={formatDuration(result.project_duration)}
          hint="unidades de tiempo"
          tone="text-indigo-500"
        />
        <StatCard
          icon={Sigma}
          label="Desviación σ"
          value={formatDecimal(result.probability?.standard_deviation)}
          hint="ruta crítica"
          tone="text-violet-500"
        />
        <StatCard
          icon={GitBranch}
          label="Críticas"
          value={`${result.critical_activities?.length ?? 0} / ${result.activities?.length ?? 0}`}
          hint="actividades"
          tone="text-amber-500"
        />
        <StatCard
          icon={Route}
          label="Probabilidad"
          value={
            probability === null || probability === undefined
              ? 'Sin T'
              : `${(probability * 100).toFixed(1)}%`
          }
          hint="P(T ≤ objetivo)"
          tone="text-emerald-500"
        />
      </div>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
          Ruta crítica
        </p>
        {criticalPath.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {criticalPath.map((activityId, index) => (
              <span key={`${activityId}-${index}`} className="contents">
                {index > 0 ? (
                  <span className="text-xs font-bold text-amber-500">→</span>
                ) : null}
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                  {activityId}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-amber-700">
            No se encontró una ruta crítica.
          </p>
        )}
      </div>
    </section>
  )
}
