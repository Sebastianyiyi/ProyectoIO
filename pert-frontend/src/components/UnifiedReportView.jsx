import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Route,
  Sparkles,
} from 'lucide-react'
import {
  getCriticalVariance,
  getUnifiedActivityRows,
} from '../lib/activityResults'
import { formatDecimal, formatDuration, formatPercent } from '../lib/format'

export function UnifiedReportView({ result, onBackToWorkspace }) {
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <FileSpreadsheet className="size-8" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-800">
          Aún no hay resultados calculados
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Ve al Workspace, define las actividades y pulsa "Resolver / Calcular" para generar el reporte unificado.
        </p>
        <button
          type="button"
          onClick={onBackToWorkspace}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
        >
          <ArrowLeft className="size-3.5" />
          Volver al Workspace
        </button>
      </div>
    )
  }

  const activities = getUnifiedActivityRows(result)
  const criticalVariance = getCriticalVariance(result)
  const prob = result?.probability
  const hasTarget =
    prob?.target_time !== null && prob?.target_time !== undefined

  const criticalActivities = activities.filter((a) => a.isCritical)

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              Reporte Unificado de Resultados PERT
            </h2>
            <p className="text-xs text-slate-500">
              Resumen probabilístico consolidado y tabla completa de actividades reales y ficticias.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-3.5" />
          <span>Volver al Workspace Dividido</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* SECCIÓN 1: BANNER HORIZONTAL RESUMEN PROBABILÍSTICO               */}
      {/* ================================================================= */}
      <section
        aria-label="Resumen probabilístico consolidado"
        className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/70 p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Resumen Probabilístico y Parámetros del Proyecto
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-3.5" />
            Duración: {formatDuration(result.project_duration)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {/* P(T <= t) */}
          <div className="rounded-xl border border-emerald-200 bg-white/90 p-3 shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              P(T ≤ {hasTarget ? prob.target_time : 't'})
            </span>
            <p className="mt-1 font-mono text-xl font-black text-emerald-700 sm:text-2xl">
              {formatPercent(prob?.probability)}
            </p>
            <span className="mt-0.5 block text-[10px] font-semibold text-emerald-600">
              {hasTarget ? 'Probabilidad lograda' : 'Define T en Workspace'}
            </span>
          </div>

          {/* Valor Z */}
          <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Valor Z
            </span>
            <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
              {formatDecimal(prob?.z_score, 4)}
            </p>
            <span className="mt-0.5 block text-[10px] text-slate-400">
              Z = (T − μ) / σ
            </span>
          </div>

          {/* Media μ */}
          <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Media (μ / TE)
            </span>
            <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
              {formatDuration(prob?.mean)}
            </p>
            <span className="mt-0.5 block text-[10px] text-slate-400">
              Duración esperada
            </span>
          </div>

          {/* Varianza RC */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Varianza RC (σ²_RC)
            </span>
            <p className="mt-1 font-mono text-xl font-black text-amber-900 sm:text-2xl">
              {formatDecimal(criticalVariance, 4)}
            </p>
            <span className="mt-0.5 block text-[10px] text-amber-700 font-semibold">
              Σ σ² de Ruta Crítica
            </span>
          </div>

          {/* Desviación σ */}
          <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Desviación (σ)
            </span>
            <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
              {formatDecimal(prob?.standard_deviation, 4)}
            </p>
            <span className="mt-0.5 block text-[10px] text-slate-400">
              √σ²_RC
            </span>
          </div>

          {/* Críticas / Total */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Act. Críticas
            </span>
            <p className="mt-1 font-mono text-xl font-black text-indigo-900 sm:text-2xl">
              {criticalActivities.length}{' '}
              <span className="text-xs font-medium text-indigo-600 font-sans">
                / {activities.length}
              </span>
            </p>
            <span className="mt-0.5 block text-[10px] text-indigo-600 font-semibold">
              Ruta sin holgura
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECCIÓN 2: TABLA COMPLETA DE ACTIVIDADES (REALES + FICTICIAS)      */}
      {/* ================================================================= */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Route className="size-4 text-slate-700" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Tabla Completa de Tiempos y Holguras del Proyecto
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {activities.length} actividades (reales + ficticias)
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Ruta Crítica Resaltada
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-3.5 py-3 text-center w-20">
                  Actividad
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[160px]">
                  Descripción
                </th>
                <th scope="col" className="px-3 py-3 text-center w-16" title="Nodo inicial i">
                  Nodo i
                </th>
                <th scope="col" className="px-3 py-3 text-center w-16" title="Nodo final j">
                  Nodo j
                </th>
                <th scope="col" className="px-3.5 py-3 text-right">
                  te
                </th>
                <th scope="col" className="px-3.5 py-3 text-right text-sky-700">
                  Ei
                </th>
                <th scope="col" className="px-3.5 py-3 text-right text-violet-700">
                  Lj
                </th>
                <th scope="col" className="px-3.5 py-3 text-right font-black text-slate-700">
                  Varianza (σ²)
                </th>
                <th scope="col" className="px-3.5 py-3 text-right">
                  Holgura (H)
                </th>
                <th scope="col" className="px-3.5 py-3 text-center w-24">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {activities.map((act) => {
                const isCrit = act.isCritical
                const isDum = act.isDummy

                return (
                  <tr
                    key={act.id}
                    className={`transition-colors ${
                      isCrit
                        ? 'bg-amber-50/70 hover:bg-amber-100/70 font-medium'
                        : isDum
                          ? 'bg-slate-50/40 text-slate-500 hover:bg-slate-50'
                          : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Actividad */}
                    <td className="px-3.5 py-3 text-center">
                      <span
                        className={`inline-grid size-7 place-items-center rounded-lg text-xs font-bold ${
                          isCrit
                            ? 'bg-amber-200/90 font-black text-amber-950 ring-1 ring-amber-300'
                            : isDum
                              ? 'border border-dashed border-slate-300 bg-white font-mono text-slate-500'
                              : 'bg-slate-100 font-bold text-slate-700 ring-1 ring-slate-200'
                        }`}
                      >
                        {act.id}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td className="px-3.5 py-3 font-semibold text-slate-800">
                      {act.name || <span className="italic text-slate-400">Sin nombre</span>}
                      {isDum && (
                        <span className="ml-2 rounded bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                          ficticia
                        </span>
                      )}
                    </td>

                    {/* Nodo i */}
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                      {act.startEvent}
                    </td>

                    {/* Nodo j */}
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                      {act.endEvent}
                    </td>

                    {/* te */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold text-slate-800">
                      {formatDuration(act.expectedTime)}
                    </td>

                    {/* Ei */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold text-sky-700">
                      {formatDuration(act.startE)}
                    </td>

                    {/* Lj */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold text-violet-700">
                      {formatDuration(act.endL)}
                    </td>

                    {/* Varianza */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold text-slate-700">
                      {formatDecimal(act.variance, 4)}
                    </td>

                    {/* Holgura */}
                    <td className={`px-3.5 py-3 text-right font-mono font-bold ${
                      isCrit ? 'text-amber-900' : 'text-slate-600'
                    }`}>
                      {formatDecimal(act.slack, 2)}
                    </td>

                    {/* Estado */}
                    <td className="px-3.5 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isCrit
                            ? 'bg-amber-200 text-amber-900 ring-1 ring-amber-300'
                            : isDum
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCrit ? 'Crítica' : isDum ? 'Ficticia' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Fila de Totales resaltada para la Ruta Crítica */}
            <tfoot className="border-t-2 border-amber-300 bg-amber-100/70 text-slate-900 font-bold">
              <tr>
                <td colSpan={4} className="px-3.5 py-3.5 text-xs font-black uppercase tracking-wider text-amber-950">
                  ★ Totales de la Ruta Crítica:
                </td>
                <td className="px-3.5 py-3.5 text-right font-mono text-sm font-black text-slate-900">
                  {formatDuration(result.project_duration)}
                </td>
                <td colSpan={2} className="px-3.5 py-3.5" aria-hidden="true" />
                <td className="px-3.5 py-3.5 text-right font-mono text-sm font-black text-amber-950">
                  {formatDecimal(criticalVariance, 4)}
                </td>
                <td className="px-3.5 py-3.5 text-right font-mono text-sm font-bold text-amber-900">
                  0.00
                </td>
                <td className="px-3.5 py-3.5 text-center">
                  <span className="inline-flex rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-black text-amber-950">
                    Ruta Crítica
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
