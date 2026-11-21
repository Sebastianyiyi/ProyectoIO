import { ArrowLeft, Clock, RotateCcw, Route } from 'lucide-react'
import { formatDuration } from '../../lib/format'

export function CpmExecutiveReport({ result, onPrev, onReset }) {
  if (!result) return <p className="p-8 text-center text-sm text-slate-500">Calcula un proyecto CPM para consultar su resumen.</p>
  const critical = result.activities.filter((activity) => activity.is_critical)
  const paths = result.critical_paths
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5 overflow-auto p-4 sm:p-7">
      <div className="border-b border-slate-200 pb-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Paso 04 · CPM</p>
        <h2 className="mt-1 text-xl font-black text-slate-900">Resumen Ejecutivo CPM</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-white p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Clock className="size-4" /> Duración del proyecto</p><p className="mt-2 font-mono text-2xl font-black text-indigo-800">{formatDuration(result.project_duration)} días</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Actividades críticas</p><p className="mt-2 font-mono text-2xl font-black text-slate-900">{critical.length} <span className="text-xs font-normal">de {result.activities.length}</span></p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Rutas críticas</p><p className="mt-2 font-mono text-2xl font-black text-slate-900">{paths.length}{result.critical_paths_truncated ? '+' : ''}</p></div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">Actividades con holgura cero</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[470px] text-left text-xs" aria-label="Actividades críticas CPM">
            <thead className="bg-slate-50 text-slate-500"><tr><th scope="col" className="px-4 py-3">Actividad</th><th scope="col" className="px-4 py-3">Nombre</th><th scope="col" className="px-4 py-3 text-right">Duración</th><th scope="col" className="px-4 py-3 text-right">Holgura</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{critical.map((activity) => <tr key={activity.id} className="bg-indigo-50/40"><td className="px-4 py-3 font-extrabold text-indigo-800">{activity.id}</td><td className="px-4 py-3 text-slate-700">{activity.name}</td><td className="px-4 py-3 text-right font-mono">{formatDuration(activity.duration)}</td><td className="px-4 py-3 text-right font-mono">0</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section aria-label="Rutas críticas CPM" className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-900"><Route className="size-4" /> Secuencia de las rutas críticas</h3>
        <div className="mt-3 space-y-3">{paths.map((path, index) => <div key={index} aria-label={`Ruta crítica CPM ${index + 1}`} className="flex flex-wrap items-center gap-2">{paths.length > 1 && <span className="text-xs font-semibold text-slate-500">{index + 1}.</span>}{path.map((id, position) => <span key={position} className="inline-flex items-center gap-2">{position > 0 && <span className="text-indigo-400">→</span>}<span className="rounded-lg bg-indigo-600 px-3 py-1.5 font-mono text-sm font-extrabold text-white">{id}</span></span>)}</div>)}</div>
        {result.critical_paths_truncated && <p className="mt-3 text-xs text-slate-500">Se muestran las primeras 100 rutas críticas. Existen más caminos con la misma duración.</p>}
      </section>
      <p className="text-xs leading-relaxed text-slate-500">La duración del proyecto corresponde al tiempo temprano del evento final. Las actividades en paralelo se consideran a través de sus dependencias.</p>
      <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
        <button type="button" onClick={onPrev} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"><ArrowLeft className="size-4" /> Anterior: tiempos y holguras</button>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"><RotateCcw className="size-4" /> Volver a configuración CPM</button>
      </div>
    </div>
  )
}
