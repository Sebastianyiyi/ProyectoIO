import { Calculator, Eraser, Loader2, Plus, Trash2 } from 'lucide-react'
import { CpmPredecessorPicker } from './CpmPredecessorPicker'

const INPUT_BASE =
  'h-9 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 shadow-none outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400'

export function CpmForm({ activities, loading, fieldErrors, onUpdate, onAdd, onRemove, onSolve, onClear }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSolve()
      }}
      className="flex flex-col h-full space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Tabla de Actividades
          </h3>
          <p className="text-[11px] text-slate-400">
            Ingresa ID, nombre, predecesores y duración fija por actividad.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          <table className="w-full min-w-[390px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-1.5 py-2 text-center w-12">ID</th>
                <th scope="col" className="px-1.5 py-2">Nombre</th>
                <th scope="col" className="px-1.5 py-2 w-24">Predecesores</th>
                <th scope="col" className="px-1.5 py-2 text-center w-28 whitespace-nowrap">Duración (días)</th>
                <th scope="col" className="px-1 py-2 text-center w-9"><span className="sr-only">Eliminar</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((activity, index) => {
                const errors = fieldErrors.byKey[activity.key] ?? {}
                const hasError = Boolean(errors.id || errors.duration)
                return (
                  <tr
                    key={activity.key}
                    className={`transition-colors ${hasError ? 'bg-rose-50/50' : 'hover:bg-slate-50/60'}`}
                  >
                    <td className="px-1 py-1.5 text-center">
                      <input
                        aria-label={`Identificador CPM ${index + 1}`}
                        value={activity.id}
                        maxLength={40}
                        onChange={(event) => onUpdate(activity.key, { id: event.target.value })}
                        disabled={loading}
                        placeholder={index === 0 ? 'A' : ''}
                        className={`${INPUT_BASE} w-11 px-1 text-center font-bold uppercase ${
                          errors.id ? 'border-rose-400 bg-rose-50 text-rose-800' : ''
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <input
                        aria-label={`Nombre CPM ${activity.id || index + 1}`}
                        value={activity.name}
                        maxLength={120}
                        onChange={(event) => onUpdate(activity.key, { name: event.target.value })}
                        disabled={loading}
                        placeholder="Nombre de la actividad"
                        className={`${INPUT_BASE} w-full min-w-[90px] px-2 font-medium`}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <CpmPredecessorPicker
                        activity={activity}
                        activities={activities}
                        onChange={(predecessors) => onUpdate(activity.key, { predecessors })}
                        disabled={loading}
                      />
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <input
                        aria-label={`Duración CPM ${activity.id || index + 1}`}
                        value={activity.duration}
                        inputMode="decimal"
                        aria-invalid={Boolean(errors.duration)}
                        onChange={(event) => onUpdate(activity.key, { duration: event.target.value })}
                        disabled={loading}
                        placeholder="Ej. 3"
                        className={`${INPUT_BASE} w-full px-2 text-center font-mono ${
                          errors.duration ? 'border-rose-400 bg-rose-50 text-rose-800' : ''
                        }`}
                      />
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <button
                        type="button"
                        aria-label={`Eliminar actividad CPM ${activity.id || index + 1}`}
                        title={activities.length <= 1 ? 'Mínimo una actividad requerida' : 'Eliminar actividad'}
                        onClick={() => onRemove(activity.key)}
                        disabled={loading || activities.length <= 1}
                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-slate-200 bg-slate-50/70 py-2 text-xs font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Agregar actividad CPM
        </button>
      </div>

      <div className="flex min-h-[50px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
          Duración fija:
        </span>
        <span className="text-[11px] text-slate-500">
          CPM trabaja con una duración fija por actividad. Puedes ingresar días enteros o decimales.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Calculator className="size-3.5" aria-hidden="true" />
          )}
          Calcular CPM y continuar
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Eraser className="size-3.5" aria-hidden="true" />
          Limpiar CPM
        </button>
      </div>
    </form>
  )
}
