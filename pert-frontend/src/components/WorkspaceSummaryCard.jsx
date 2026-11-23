import { ArrowRight, CheckCircle2, Clock, Percent, ShieldCheck } from 'lucide-react'
import { formatDecimal, formatDuration, formatPercent } from '../lib/format'

export function WorkspaceSummaryCard({ result, onGoToReport }) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
        <p className="text-xs font-semibold text-slate-500">
          Sin solución calculada
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Haz clic en "Resolver / Calcular" para generar la red y el análisis PERT.
        </p>
      </div>
    )
  }

  const prob = result?.probability
  const hasTarget =
    prob?.target_time !== null && prob?.target_time !== undefined

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/50 p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-indigo-100/60 pb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Resumen de Solución
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          <CheckCircle2 className="size-3" />
          Resuelto
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/90 p-2 border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="size-3 text-indigo-500" /> Duración
          </span>
          <p className="mt-0.5 text-base font-extrabold text-slate-900 font-mono">
            {formatDuration(result.project_duration)}
          </p>
        </div>

        <div className="rounded-lg bg-white/90 p-2 border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Percent className="size-3 text-emerald-500" /> P(T ≤ {hasTarget ? prob.target_time : 't'})
          </span>
          <p className="mt-0.5 text-base font-extrabold text-emerald-700 font-mono">
            {formatPercent(prob?.probability)}
          </p>
        </div>
      </div>

      {hasTarget && (
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-white/80 p-1.5 border border-slate-100 text-[10px] font-mono text-center">
          <div>
            <span className="text-slate-400 block font-sans">Z</span>
            <span className="font-bold text-slate-700">
              {formatDecimal(prob.z_score, 3)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">μ</span>
            <span className="font-bold text-slate-700">
              {formatDecimal(prob.mean, 1)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">σ²_RC</span>
            <span className="font-bold text-amber-700">
              {formatDecimal(prob.critical_variance, 2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">σ</span>
            <span className="font-bold text-slate-700">
              {formatDecimal(prob.standard_deviation, 2)}
            </span>
          </div>
        </div>
      )}

      {onGoToReport && (
        <button
          type="button"
          onClick={onGoToReport}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <span>Ver Reporte Unificado Completo</span>
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </div>
  )
}
