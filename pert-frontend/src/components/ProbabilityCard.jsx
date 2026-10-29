import { Percent } from 'lucide-react'
import { formatDecimal, formatDuration, formatProbability } from '../lib/format'

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
          Probabilidad
        </h2>
        <Percent className="size-4 text-emerald-500" aria-hidden="true" />
      </div>

      {hasTarget ? (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black tracking-tight text-emerald-600">
              {formatProbability(probability.probability)}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              P(T ≤ {formatDuration(probability.target_time)})
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-right ring-1 ring-inset ring-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Z
            </p>
            <p className="font-mono text-sm font-bold text-slate-800">
              {formatDecimal(probability.z_score)}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          Define un tiempo objetivo T para calcular Z y la probabilidad de
          terminar el proyecto a tiempo.
        </p>
      )}

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Media
          </dt>
          <dd className="mt-0.5 font-mono text-xs font-bold text-slate-700">
            {formatDuration(probability.mean)}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Var. RC
          </dt>
          <dd className="mt-0.5 font-mono text-xs font-bold text-slate-700">
            {formatDecimal(probability.critical_variance)}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            σ
          </dt>
          <dd className="mt-0.5 font-mono text-xs font-bold text-slate-700">
            {formatDecimal(probability.standard_deviation)}
          </dd>
        </div>
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
