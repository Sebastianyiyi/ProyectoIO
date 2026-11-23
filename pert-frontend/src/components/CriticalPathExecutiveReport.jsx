import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  Route,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { getActivityRows, getCriticalVariance } from '../lib/activityResults'
import { formatDecimal, formatDuration, formatPercent } from '../lib/format'

export function CriticalPathExecutiveReport({
  result,
  onPrev,
  onReset,
}) {
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">
          Aún no se ha calculado la solución del proyecto.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
        >
          Ir a Configuración (Paso 1)
        </button>
      </div>
    )
  }

  const allActivities = getActivityRows(result)
  const criticalActivities = allActivities.filter((a) => Boolean(a.is_critical))
  const criticalSequence = result.critical_path ?? criticalActivities.map((a) => a.id)
  const criticalVariance = getCriticalVariance(result)
  const totalDuration = result.project_duration
  const prob = result?.probability
  const hasTarget = prob?.target_time !== null && prob?.target_time !== undefined

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7 space-y-5 max-w-6xl mx-auto w-full flex flex-col justify-between">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Paso 04 · Resumen Ejecutivo
            </span>
            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              Resumen Ejecutivo y Secuencia de la Ruta Crítica
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-3.5" />
            Proyecto Resuelto
          </span>
        </div>

        {/* 1. Métricas Principales */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Duración Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="size-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Duración del Proyecto
              </span>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-slate-900">
              {formatDuration(totalDuration)}
            </p>
            <span className="text-[11px] text-slate-400">
              Unidades de tiempo estimadas
            </span>
          </div>

          {/* Actividades Críticas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Route className="size-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Actividades Críticas
              </span>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-slate-900">
              {criticalActivities.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">
                de {allActivities.length} actividades
              </span>
            </p>
            <span className="text-[11px] text-slate-400">
              Actividades con holgura cero
            </span>
          </div>

          {/* Probabilidad o Varianza RC */}
          {hasTarget ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-700">
                <TrendingUp className="size-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Probabilidad P(T ≤ {prob.target_time})
                </span>
              </div>
              <p className="mt-2 font-mono text-2xl font-black text-emerald-800">
                {formatPercent(prob?.probability)}
              </p>
              <span className="text-[11px] text-emerald-600">
                Z = {formatDecimal(prob?.z_score, 3)} · σ = {formatDecimal(prob?.standard_deviation, 3)}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-500">
                <Sparkles className="size-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Varianza RC (Σ σ²)
                </span>
              </div>
              <p className="mt-2 font-mono text-2xl font-black text-slate-900">
                {formatDecimal(criticalVariance, 4)}
              </p>
              <span className="text-[11px] text-slate-400">
                Varianza acumulada del camino crítico
              </span>
            </div>
          )}
        </div>

        {/* 2. Tabla Exclusiva de Ruta Crítica */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <Route className="size-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tabla de Actividades de la Ruta Crítica
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Holgura H = 0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-center w-20">
                    Actividad
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Nombre / Descripción
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right w-28">
                    te (Tiempo)
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-center w-28">
                    Holgura
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalActivities.length > 0 ? (
                  criticalActivities.map((act) => (
                    <tr
                      key={act.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-grid size-7 place-items-center rounded-lg bg-indigo-50 font-black text-indigo-800 ring-1 ring-inset ring-indigo-200">
                          {act.id}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {act.name || <span className="italic text-slate-400">Sin nombre</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatDuration(act.expected_time)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
                          0
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-xs text-slate-400">
                      No se detectaron actividades críticas.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-700">
                <tr>
                  <td colSpan={2} className="px-4 py-2.5 text-xs uppercase tracking-wider">
                    Total Duración Ruta Crítica:
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-black text-slate-900">
                    {formatDuration(totalDuration)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-slate-400">
                    0.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 3. Banner Destacado de Secuencia (Mensaje Final) */}
        <section
          aria-label="Secuencia de la ruta crítica"
          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Route className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Secuencia Final de Ruta Crítica
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-700">
                    Ruta Crítica:
                  </span>
                  {criticalSequence.length > 0 ? (
                    criticalSequence.map((actId, index) => (
                      <span key={`${actId}-${index}`} className="inline-flex items-center gap-1.5">
                        {index > 0 && (
                          <span className="font-mono text-xs font-bold text-slate-400">
                            →
                          </span>
                        )}
                        <span className="inline-grid size-7 place-items-center rounded-lg bg-indigo-600 font-mono text-xs font-black text-white shadow-xs">
                          {actId}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Sin secuencia</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-right shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Plazo mínimo garantizado
              </span>
              <span className="font-mono text-sm font-black text-slate-900">
                {formatDuration(totalDuration)} días
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>Anterior: Resultados y Probabilidad (Paso 3)</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
        >
          <RotateCcw className="size-3.5" />
          <span>Volver al Inicio (Paso 1)</span>
        </button>
      </div>
    </div>
  )
}
