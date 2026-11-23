import {
  getActivityRows,
  getCriticalVariance,
} from '../lib/activityResults'
import { formatDecimal, formatDuration } from '../lib/format'

const HEADER_CELL = 'px-3 py-3 font-bold'
const BODY_CELL = 'px-3 py-3'

export function ActivitiesTable({ result }) {
  const activities = getActivityRows(result)
  const criticalVariance = getCriticalVariance(result)
  const hasTarget =
    result?.probability?.target_time !== null &&
    result?.probability?.target_time !== undefined

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Tiempos por actividad
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {activities.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th
                scope="col"
                className={`${HEADER_CELL} sticky left-0 z-20 border-r border-slate-200 bg-slate-50`}
              >
                Actividad
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                te
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                Ei
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                Lj
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                Varianza (σ²)
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                Holgura (H)
              </th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {activities.map((activity) => {
              const isCritical = Boolean(activity.is_critical)

              return (
                <tr
                  key={activity.id}
                  title={[
                    activity.expected_time_formula,
                    activity.variance_formula,
                    activity.slack_formula,
                  ]
                    .filter(Boolean)
                    .join('\n')}
                  className={isCritical ? 'bg-amber-50/70' : ''}
                >
                  <th
                    scope="row"
                    className={`${BODY_CELL} sticky left-0 z-10 border-r border-slate-100 text-left font-normal ${
                      isCritical ? 'bg-amber-50' : 'bg-white'
                    }`}
                  >
                    <span className="block font-bold text-slate-800">
                      {activity.id}
                    </span>
                    {activity.name && activity.name !== activity.id ? (
                      <span className="mt-0.5 block max-w-[150px] truncate text-[11px] font-medium text-slate-400">
                        {activity.name}
                      </span>
                    ) : null}
                  </th>
                  <td className={`${BODY_CELL} text-right font-mono text-slate-700`}>
                    {formatDuration(activity.expected_time)}
                  </td>
                  <td className={`${BODY_CELL} text-right font-mono text-sky-700`}>
                    {formatDuration(activity.startE)}
                  </td>
                  <td className={`${BODY_CELL} text-right font-mono text-violet-700`}>
                    {formatDuration(activity.endL)}
                  </td>
                  <td className={`${BODY_CELL} text-right font-mono text-slate-600`}>
                    {formatDecimal(activity.variance)}
                  </td>
                  <td className={`${BODY_CELL} text-right font-mono text-slate-700`}>
                    {formatDecimal(activity.slack)}
                  </td>
                  <td className={`${BODY_CELL} text-right`}>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
                        isCritical
                          ? 'bg-amber-100 text-amber-800 ring-amber-200'
                          : 'bg-slate-100 text-slate-500 ring-slate-200'
                      }`}
                    >
                      {isCritical ? 'Crítica' : 'Normal'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-amber-200 bg-amber-50/75">
              <td colSpan={4} className="px-3 py-3" aria-hidden="true" />
              <td className="border-l border-amber-200 px-3 py-3 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Σ σ² (Ruta Crítica)
                </span>
                <span className="mt-0.5 block font-mono text-sm font-black text-amber-900">
                  {formatDecimal(criticalVariance)}
                </span>
              </td>
              <td colSpan={2} className="px-3 py-3 align-middle">
                <div className="rounded-xl border border-amber-200 bg-white/80 px-2.5 py-1.5 text-amber-900">
                  <p
                    className="font-mono text-xs font-bold"
                    aria-label="Z = (T − T_E) / √(Σ σ² de la ruta crítica)"
                  >
                    Z = (T − T<sub>E</sub>) / √Σσ²<sub>RC</sub>
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-amber-700">
                    {hasTarget
                      ? `T = ${formatDuration(result.probability.target_time)} · T_E = ${formatDuration(result.probability.mean)}`
                      : 'Define T en Configuración para calcular Z'}
                  </p>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
