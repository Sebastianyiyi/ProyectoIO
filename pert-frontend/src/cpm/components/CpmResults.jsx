import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { getUnifiedActivityRows } from '../lib/activityRows'
import { formatDuration } from '../../lib/format'

const TH_CELL = 'px-4 py-3 text-xs font-bold uppercase tracking-wider'
const TD_CELL = 'px-4 py-3 text-sm'

export function CpmResults({ result, onPrev, onNext }) {
  if (!result) {
    return (
      <section aria-label="Tiempos y holguras CPM" className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">
          Aún no hay resultados CPM calculados.
        </p>
      </section>
    )
  }

  const rows = getUnifiedActivityRows(result).sort((a, b) =>
    a.startEvent - b.startEvent || a.endEvent - b.endEvent || a.id.localeCompare(b.id),
  )
  const dummyCount = result.edges.filter((edge) => edge.is_dummy).length

  return (
    <section
      aria-label="Tiempos y holguras CPM"
      className="h-full overflow-y-auto p-5 sm:p-7 space-y-5 max-w-6xl mx-auto w-full flex flex-col justify-between"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Paso 03 · Tiempos y Holguras
            </span>
            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              Tiempos y Holguras CPM
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Cálculos Generados
          </span>
        </div>

        <section
          aria-label="Resumen y fórmulas CPM"
          className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/60 p-4 sm:p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-indigo-100 pb-2">
            <Sparkles className="size-4 text-indigo-600" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Resumen y Fórmulas del Método CPM (Duración Fija)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-600">
                Duración del Proyecto
              </span>
              <p className="mt-1 font-mono text-xl font-black text-sky-800 sm:text-2xl">
                {formatDuration(result.project_duration)} días
              </p>
              <span className="mt-0.5 block text-[10px] text-sky-600">
                Tiempo temprano del evento final
              </span>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-white/90 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actividades Críticas
              </span>
              <p className="mt-1 font-mono text-xl font-black text-indigo-700 sm:text-2xl">
                {result.critical_activities.length} de {result.activities.length}
              </p>
              <span className="mt-0.5 block text-[10px] font-semibold text-indigo-600">
                Actividades con holgura H = 0
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actividades Ficticias
              </span>
              <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
                {dummyCount}
              </p>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Arcos de dependencia (D = 0)
              </span>
            </div>
          </div>

          <div
            aria-label="Procedimiento CPM"
            className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3"
          >
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5">
              <p className="text-xs font-bold text-sky-800">1. Paso adelante</p>
              <p className="mt-0.5 font-mono text-xs text-slate-700">Eⱼ = max(Eᵢ + Dᵢⱼ)</p>
              <p className="mt-0.5 text-[11px] text-slate-500">El evento inicial comienza en E = 0.</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5">
              <p className="text-xs font-bold text-violet-800">2. Paso atrás</p>
              <p className="mt-0.5 font-mono text-xs text-slate-700">Lᵢ = min(Lⱼ − Dᵢⱼ)</p>
              <p className="mt-0.5 text-[11px] text-slate-500">En el evento final, L = E.</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5">
              <p className="text-xs font-bold text-indigo-800">3. Holgura total</p>
              <p className="mt-0.5 font-mono text-xs text-slate-700">H = Lⱼ − Eᵢ − Dᵢⱼ</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Las actividades con H = 0 son críticas.</p>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Tabla de Actividades y Holguras CPM
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Inicio temprano (Ei), fin tardío (Lj), duración (Dij) y holgura total (H).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {rows.length} {rows.length === 1 ? 'arco' : 'arcos'}
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                  Ruta Crítica destacada
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left" aria-label="Actividades y holguras CPM">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th scope="col" className={`${TH_CELL} text-center w-24`}>
                      Actividad
                    </th>
                    <th scope="col" className={`${TH_CELL} text-center`}>
                      Eventos i → j
                    </th>
                    <th scope="col" className={`${TH_CELL} text-right text-sky-700`}>
                      Ei
                    </th>
                    <th scope="col" className={`${TH_CELL} text-right text-violet-700`}>
                      Lj
                    </th>
                    <th scope="col" className={`${TH_CELL} text-right`}>
                      Dij
                    </th>
                    <th scope="col" className={`${TH_CELL} text-right`}>
                      Holgura (H)
                    </th>
                    <th scope="col" className={`${TH_CELL} text-center`}>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => {
                    const isCritical = Boolean(row.isCritical)
                    return (
                      <tr
                        key={`${row.isDummy ? 'dummy' : 'real'}-${row.id}`}
                        className={`transition-colors ${
                          isCritical
                            ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                            : row.isDummy
                              ? 'bg-slate-50/60 hover:bg-slate-100/60'
                              : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className={`${TD_CELL} text-center`} title={row.name}>
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`inline-grid size-8 place-items-center rounded-xl font-bold ${
                                isCritical
                                  ? 'bg-indigo-100 font-black text-indigo-900 ring-1 ring-indigo-300'
                                  : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                              }`}
                            >
                              {row.id}
                            </span>
                            {row.isDummy && (
                              <span className="text-[11px] font-medium text-slate-400">
                                (ficticia)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`${TD_CELL} text-center font-mono text-xs font-semibold text-slate-500`}>
                          {row.startEvent} → {row.endEvent}
                        </td>
                        <td className={`${TD_CELL} text-right font-mono font-semibold text-sky-600`}>
                          {formatDuration(row.startE)}
                        </td>
                        <td className={`${TD_CELL} text-right font-mono font-semibold text-violet-600`}>
                          {formatDuration(row.endL)}
                        </td>
                        <td className={`${TD_CELL} text-right font-mono font-semibold text-slate-800`}>
                          {formatDuration(row.expectedTime)}
                        </td>
                        <td
                          className={`${TD_CELL} text-right font-mono font-semibold ${
                            isCritical ? 'text-indigo-700' : 'text-slate-600'
                          }`}
                        >
                          {formatDuration(row.slack)}
                        </td>
                        <td className={`${TD_CELL} text-center`}>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                              isCritical
                                ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                                : 'bg-slate-100 text-slate-600 ring-slate-200'
                            }`}
                          >
                            {isCritical ? 'Crítica' : 'Con holgura'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
              Las ficticias tienen duración 0 y representan dependencias. La duración del proyecto se obtiene del evento final.
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3.5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Tiempos por Evento
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Valores E y L calculados por nodo.
              </p>
            </div>
            <table className="w-full text-center text-xs" aria-label="Tiempos por evento CPM">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-3">Evento</th>
                  <th scope="col" className="px-3 py-3 text-sky-700">E</th>
                  <th scope="col" className="px-3 py-3 text-violet-700">L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.nodes.map((node) => (
                  <tr
                    key={node.id}
                    className={`transition-colors ${
                      node.is_critical
                        ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-grid size-7 place-items-center rounded-lg font-bold ${
                          node.is_critical
                            ? 'bg-indigo-100 text-indigo-900 ring-1 ring-indigo-300'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                        }`}
                      >
                        {node.event}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-sky-600">
                      {formatDuration(node.E)}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-violet-600">
                      {formatDuration(node.L)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Anterior: Red AOA CPM (Paso 2)</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
        >
          <span>Siguiente: Resumen Ejecutivo CPM (Paso 4)</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
