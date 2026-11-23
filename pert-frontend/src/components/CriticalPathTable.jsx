import { Route, Sparkles } from 'lucide-react'
import { getActivityRows, getCriticalVariance } from '../lib/activityResults'
import { formatDecimal, formatDuration } from '../lib/format'

export function CriticalPathTable({ result }) {
  if (!result) {
    return null
  }

  const allRows = getActivityRows(result)
  const criticalActivities = allRows.filter((row) => Boolean(row.is_critical))
  const criticalVariance = getCriticalVariance(result)
  const totalDuration = result.project_duration

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200/90 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/60 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-300">
            <Route className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">
              Ruta Crítica
            </h3>
            <p className="text-xs text-amber-900/70">
              Actividades determinantes que no admiten retraso sin afectar el plazo global.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-300">
            <Sparkles className="size-3 text-amber-700" />
            {criticalActivities.length} actividades críticas
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-mono text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            Duración: {formatDuration(totalDuration)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-amber-100 bg-amber-50/30 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-24">
                Actividad
              </th>
              <th scope="col" className="px-4 py-3">
                Nombre de la actividad
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Tiempo te
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Varianza (σ²)
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Holgura
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100/60">
            {criticalActivities.length > 0 ? (
              criticalActivities.map((act) => (
                <tr
                  key={act.id}
                  className="bg-amber-50/20 transition-colors hover:bg-amber-50/60"
                >
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-grid size-8 place-items-center rounded-xl bg-amber-100 font-black text-amber-950 ring-1 ring-amber-300">
                      {act.id}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {act.name || <span className="italic text-slate-400">Sin nombre</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                    {formatDuration(act.expected_time)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-700">
                    {formatDecimal(act.variance)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                      0.00
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-slate-400">
                  No se detectaron actividades críticas.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot className="border-t-2 border-amber-200 bg-amber-50/70 font-semibold text-slate-800">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-amber-900">
                Totales de la Ruta Crítica:
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-black text-slate-900">
                {formatDuration(totalDuration)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-black text-amber-900">
                {formatDecimal(criticalVariance)}
              </td>
              <td className="px-4 py-3 text-center text-xs text-amber-700 font-bold">
                Crítica
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
