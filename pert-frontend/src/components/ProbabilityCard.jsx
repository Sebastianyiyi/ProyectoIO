import { Percent } from 'lucide-react'
import { formatDecimal, formatDuration, formatProbability } from '../lib/format'

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm font-black text-slate-800">
        {value}
      </dd>
    </div>
  )
}

export function ProbabilityCard({ result }) {
  const probability = result.probability

  if (!probability) {
    return null
  }

  const hasTarget =
    probability.target_time !== null && probability.target_time !== undefined

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Probabilidad del proyecto
        </h2>
        <Percent className="size-4 text-emerald-500" aria-hidden="true" />
      </div>

      <div
        className={`mt-3 rounded-2xl border p-4 ${
          hasTarget
            ? 'border-emerald-200 bg-emerald-50/70'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {hasTarget
            ? `P(T ≤ ${formatDuration(probability.target_time)})`
            : 'Probabilidad de terminar a tiempo'}
        </p>
        <p
          className={`mt-1 text-[32px] font-black leading-none tracking-tight ${
            hasTarget ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {hasTarget ? formatProbability(probability.probability) : '—'}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {hasTarget
            ? 'Probabilidad acumulada de completar el proyecto dentro del tiempo objetivo.'
            : 'Define un tiempo objetivo T en Configuración para calcular Z y la probabilidad.'}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard
          label="Valor Z"
          value={hasTarget ? formatDecimal(probability.z_score) : '—'}
        />
        <MetricCard label="Media (μ)" value={formatDuration(probability.mean)} />
        <MetricCard
          label="Varianza RC (σ²)"
          value={formatDecimal(probability.critical_variance)}
        />
        <MetricCard
          label="Desviación (σ)"
          value={formatDecimal(probability.standard_deviation)}
        />
      </dl>

      <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500">
          Ver fórmula aplicada
        </summary>
        <p className="mt-2 break-words font-mono text-[11px] leading-5 text-slate-600">
          {probability.formula}
        </p>
      </details>
    </section>
  )
}
