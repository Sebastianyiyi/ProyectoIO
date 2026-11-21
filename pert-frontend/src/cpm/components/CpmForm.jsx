import { Calculator, Eraser, Loader2, Plus, Trash2 } from 'lucide-react'
import { CpmPredecessorPicker } from './CpmPredecessorPicker'

const INPUT = 'h-9 w-full rounded-lg border bg-white px-2 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50'

export function CpmForm({ activities, loading, fieldErrors, onUpdate, onAdd, onRemove, onSolve, onClear }) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSolve() }} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Actividades CPM</h3>
          <p className="mt-1 text-xs text-slate-500">Define las dependencias y una duración fija por actividad.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{activities.length} actividades</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="max-h-[460px] overflow-auto">
          <table className="w-full min-w-[570px] text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="w-16 px-2 py-3">ID</th>
                <th scope="col" className="px-2 py-3">Nombre</th>
                <th scope="col" className="w-28 px-2 py-3">Predecesores</th>
                <th scope="col" className="w-28 px-2 py-3">Duración (días)</th>
                <th scope="col" className="w-10 px-2 py-3"><span className="sr-only">Eliminar</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((activity, index) => {
                const errors = fieldErrors.byKey[activity.key] ?? {}
                const border = (field) => errors[field] ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                return (
                  <tr key={activity.key} className={Object.keys(errors).length ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="px-2 py-2"><input aria-label={`Identificador CPM ${index + 1}`} value={activity.id} maxLength={40} onChange={(event) => onUpdate(activity.key, { id: event.target.value })} disabled={loading} className={`${INPUT} ${border('id')} min-w-12 text-center font-bold`} placeholder="A" /></td>
                    <td className="px-2 py-2"><input aria-label={`Nombre CPM ${activity.id || index + 1}`} value={activity.name} maxLength={120} onChange={(event) => onUpdate(activity.key, { name: event.target.value })} disabled={loading} className={`${INPUT} border-slate-200 min-w-40`} placeholder="Nombre de la actividad" /></td>
                    <td className="px-2 py-2"><CpmPredecessorPicker activity={activity} activities={activities} onChange={(predecessors) => onUpdate(activity.key, { predecessors })} disabled={loading} /></td>
                    <td className="px-2 py-2"><input aria-label={`Duración CPM ${activity.id || index + 1}`} value={activity.duration} inputMode="decimal" aria-invalid={Boolean(errors.duration)} onChange={(event) => onUpdate(activity.key, { duration: event.target.value })} disabled={loading} className={`${INPUT} ${border('duration')} min-w-20 text-center font-mono`} placeholder="Ej. 3" /></td>
                    <td className="px-2 py-2"><button type="button" aria-label={`Eliminar actividad CPM ${activity.id || index + 1}`} onClick={() => onRemove(activity.key)} disabled={loading || activities.length <= 1} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"><Trash2 className="size-4" /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={onAdd} disabled={loading} className="flex w-full items-center justify-center gap-2 border-t border-dashed border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-600 disabled:opacity-50"><Plus className="size-3.5" /> Agregar actividad CPM</button>
      </div>
      <p className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs text-indigo-800">CPM trabaja con una duración fija por actividad. Puedes ingresar días enteros o decimales.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <Calculator className="size-4" />} Calcular CPM y continuar</button>
        <button type="button" onClick={onClear} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50"><Eraser className="size-4" /> Limpiar CPM</button>
      </div>
    </form>
  )
}
