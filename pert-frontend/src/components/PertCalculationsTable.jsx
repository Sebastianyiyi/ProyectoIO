import {
  getActivityRows,
} from '../lib/activityResults'
import { formatDecimal, formatDuration } from '../lib/format'

const TH_CELL = 'px-4 py-3.5 text-xs font-bold uppercase tracking-wider'
const TD_CELL = 'px-4 py-3 text-sm'

export function PertCalculationsTable({ result }) {
  const activities = getActivityRows(result)

  // Calculate sum of variances
  const totalVariance = activities.reduce(
    (sum, a) => sum + (Number(a.variance) || 0),
    0,
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Tabla de Tiempos y Holguras PERT
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Cálculo de tiempo esperado (te), inicio temprano (Ei), fin tardío (Lj), varianza y holgura.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {activities.length} actividades
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            Ruta Crítica destacada
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th scope="col" className={`${TH_CELL} text-center w-24`}>
                Actividad
              </th>
              <th scope="col" className={`${TH_CELL} text-right`}>
                te
              </th>
              <th scope="col" className={`${TH_CELL} text-right text-sky-700`}>
                Ei
              </th>
              <th scope="col" className={`${TH_CELL} text-right text-violet-700`}>
                Lj
              </th>
              <th scope="col" className={`${TH_CELL} text-right font-black text-slate-700`}>
                Varianza (σ²)
              </th>
              <th scope="col" className={`${TH_CELL} text-right`}>
                Holgura (H)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {activities.map((activity) => {
              const isCritical = Boolean(activity.is_critical)

              return (
                <tr
                  key={activity.id}
                  className={`transition-colors ${
                    isCritical
                      ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Actividad (solo las letras) */}
                  <td className={`${TD_CELL} text-center`}>
                    <span
                      className={`inline-grid size-8 place-items-center rounded-xl font-bold ${
                        isCritical
                          ? 'bg-indigo-100 font-black text-indigo-900 ring-1 ring-indigo-300'
                          : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                      }`}
                    >
                      {activity.id}
                    </span>
                  </td>

                  {/* te */}
                  <td className={`${TD_CELL} text-right font-mono font-semibold text-slate-800`}>
                    {formatDuration(activity.expected_time)}
                  </td>

                  {/* Ei */}
                  <td className={`${TD_CELL} text-right font-mono font-semibold text-sky-600`}>
                    {formatDuration(activity.startE)}
                  </td>

                  {/* Lj */}
                  <td className={`${TD_CELL} text-right font-mono font-semibold text-violet-600`}>
                    {formatDuration(activity.endL)}
                  </td>

                  {/* Varianza */}
                  <td className={`${TD_CELL} text-right font-mono font-semibold text-slate-700`}>
                    {formatDecimal(activity.variance)}
                  </td>

                  {/* Holgura */}
                  <td className={`${TD_CELL} text-right font-mono font-semibold ${
                    isCritical ? 'text-indigo-700' : 'text-slate-600'
                  }`}>
                    {formatDecimal(activity.slack)}
                  </td>
                </tr>
              )
            })}
          </tbody>

          {/* Sumatoria al final de varianza */}
          <tfoot className="border-t-2 border-slate-200 bg-slate-50/90">
            <tr className="font-semibold text-slate-800">
              <td colSpan={4} className="px-4 py-3.5 text-right font-bold text-xs uppercase tracking-wider text-slate-500">
                Sumatoria Varianza (Σ σ²):
              </td>
              <td className="px-4 py-3.5 text-right">
                <span className="font-mono text-base font-black text-indigo-700">
                  {formatDecimal(totalVariance)}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right text-xs text-slate-400">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
