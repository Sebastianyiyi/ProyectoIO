import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { getUnifiedActivityRows } from '../lib/activityRows'
import { formatDuration } from '../../lib/format'

export function CpmResults({ result, onPrev, onNext }) {
  if (!result) {
    return <p className="p-8 text-center text-sm text-slate-500">Aún no hay resultados CPM calculados.</p>
  }

  const rows = getUnifiedActivityRows(result).sort((a, b) =>
    a.startEvent - b.startEvent || a.endEvent - b.endEvent || a.id.localeCompare(b.id),
  )
  const dummyCount = result.edges.filter((edge) => edge.is_dummy).length
  const metrics = [
    ['Duración del proyecto', `${formatDuration(result.project_duration)} días`],
    ['Actividades críticas', `${result.critical_activities.length} de ${result.activities.length}`],
    ['Actividades ficticias', String(dummyCount)],
  ]

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-5 overflow-y-auto p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Paso 03 · Método CPM</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Tiempos y Holguras CPM</h2>
          <p className="mt-1 text-xs text-slate-500">Duraciones fijas y cálculo de la ruta crítica.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="size-3.5" /> Cálculos generados
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 font-mono text-2xl font-black text-indigo-800">{value}</p>
          </div>
        ))}
      </div>

      <section aria-label="Procedimiento CPM" className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-100/70 p-4 text-sm sm:grid-cols-3">
        <div><p className="font-bold text-sky-800">1. Paso adelante</p><p className="mt-1 font-mono text-xs">Eⱼ = max(Eᵢ + Dᵢⱼ)</p><p className="mt-1 text-xs text-slate-500">El evento inicial comienza en E = 0.</p></div>
        <div><p className="font-bold text-violet-800">2. Paso atrás</p><p className="mt-1 font-mono text-xs">Lᵢ = min(Lⱼ − Dᵢⱼ)</p><p className="mt-1 text-xs text-slate-500">En el evento final, L = E.</p></div>
        <div><p className="font-bold text-indigo-800">3. Holgura total</p><p className="mt-1 font-mono text-xs">H = Lⱼ − Eᵢ − Dᵢⱼ</p><p className="mt-1 text-xs text-slate-500">Las actividades con H = 0 son críticas.</p></div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800">Tabla de Actividades y Holguras CPM</h3>
            <p className="mt-1 text-xs text-slate-500">Eᵢ: inicio temprano · Lⱼ: fin tardío · Dᵢⱼ: duración · H: holgura total.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs" aria-label="Actividades y holguras CPM">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>{['Actividad', 'Eventos i → j', 'Eᵢ', 'Lⱼ', 'Dᵢⱼ', 'H', 'Estado'].map((title) => <th key={title} scope="col" className="whitespace-nowrap px-3 py-3 font-bold">{title}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={`${row.isDummy ? 'dummy' : 'real'}-${row.id}`} className={row.isCritical ? 'bg-indigo-50/60' : row.isDummy ? 'bg-slate-50/80' : ''}>
                    <td className="px-3 py-3 font-extrabold text-slate-800" title={row.name}>{row.id}{row.isDummy && <span className="ml-1 font-normal text-slate-400">(ficticia)</span>}</td>
                    <td className="px-3 py-3 font-mono text-slate-500">{row.startEvent} → {row.endEvent}</td>
                    {[row.startE, row.endL, row.expectedTime, row.slack].map((value, index) => <td key={index} className="px-3 py-3 font-mono font-semibold text-slate-700">{formatDuration(value)}</td>)}
                    <td className={`px-3 py-3 font-semibold ${row.isCritical ? 'text-indigo-700' : 'text-slate-500'}`}>{row.isCritical ? 'Crítica' : 'Con holgura'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Las ficticias tienen duración 0 y representan dependencias. La duración del proyecto se obtiene del evento final.</p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">Tiempos por evento</h3>
          <table className="w-full text-center text-xs" aria-label="Tiempos por evento CPM">
            <thead className="bg-slate-50 text-slate-500"><tr>{['Evento', 'E', 'L'].map((label) => <th key={label} scope="col" className="px-3 py-2">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{result.nodes.map((node) => (
              <tr key={node.id} className={node.is_critical ? 'bg-indigo-50/50' : ''}>
                <td className="px-3 py-2 font-bold">{node.event}</td><td className="px-3 py-2 font-mono text-sky-700">{formatDuration(node.E)}</td><td className="px-3 py-2 font-mono text-violet-700">{formatDuration(node.L)}</td>
              </tr>
            ))}</tbody>
          </table>
        </section>
      </div>

      <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
        <button type="button" onClick={onPrev} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"><ArrowLeft className="size-3.5" /> Anterior: Red AOA y Datos (Paso 2)</button>
        <button type="button" onClick={onNext} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">Siguiente: Resumen Ejecutivo (Paso 4) <ArrowRight className="size-3.5" /></button>
      </div>
    </div>
  )
}
