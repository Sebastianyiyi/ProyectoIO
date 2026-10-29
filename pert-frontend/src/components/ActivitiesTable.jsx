import { formatDecimal, formatDuration } from '../lib/format'

export function ActivitiesTable({ result }) {
  const activities = result.activities ?? []

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Actividades
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {activities.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold">
                Act.
              </th>
              <th scope="col" className="px-3 py-2 text-right font-bold">
                te
              </th>
              <th scope="col" className="px-3 py-2 text-right font-bold">
                Var
              </th>
              <th scope="col" className="px-3 py-2 text-right font-bold">
                H
              </th>
              <th scope="col" className="px-3 py-2 text-right font-bold">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <tr
                key={activity.id}
                title={[
                  activity.expected_time_formula,
                  activity.variance_formula,
                  activity.slack_formula,
                ].join('\n')}
                className={activity.is_critical ? 'bg-amber-50/70' : ''}
              >
                <td className="px-3 py-2">
                  <span className="font-bold text-slate-800">{activity.id}</span>
                  {activity.name && activity.name !== activity.id ? (
                    <span className="block max-w-[120px] truncate text-[10px] text-slate-400">
                      {activity.name}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-right font-mono text-slate-700">
                  {formatDuration(activity.expected_time)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-slate-500">
                  {formatDecimal(activity.variance)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-slate-700">
                  {formatDecimal(activity.slack)}
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                      activity.is_critical
                        ? 'bg-amber-100 text-amber-800 ring-amber-200'
                        : 'bg-slate-100 text-slate-500 ring-slate-200'
                    }`}
                  >
                    {activity.is_critical ? 'Crítica' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
