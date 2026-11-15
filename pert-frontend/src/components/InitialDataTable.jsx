export function InitialDataTable({ activities = [], result = null }) {
  // Use activities from result if available, or input activities
  const rows =
    result?.activities && result.activities.length > 0
      ? result.activities
      : activities

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
          Actividades
        </h3>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200/60">
          {rows.length} {rows.length === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-2.5 text-center w-20">
                Act.
              </th>
              <th scope="col" className="px-4 py-2.5">
                Predecesores
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((act) => {
              const predecessors = Array.isArray(act.predecessors)
                ? act.predecessors
                : []

              return (
                <tr
                  key={act.key || act.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-2 text-center">
                    <span className="inline-grid size-7 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200/60">
                      {act.id || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {predecessors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {predecessors.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        — Inicio
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
