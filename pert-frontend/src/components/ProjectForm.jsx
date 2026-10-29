import { Calculator, Eraser, Loader2, Plus } from 'lucide-react'
import { ActivityRow } from './ActivityRow'

export function ProjectForm({
  activities,
  targetTime,
  onTargetTimeChange,
  onUpdateActivity,
  onAddActivity,
  onRemoveActivity,
  onSolve,
  onClear,
  loading,
  fieldErrors,
}) {
  const disabled = loading
  const generalErrors = fieldErrors?.general ?? []

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSolve()
      }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Proyecto
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Define las actividades, sus predecesores y los tiempos PERT.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">
          {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>

      {generalErrors.length > 0 ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <p className="font-semibold">Revisa el proyecto:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {generalErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityRow
            key={activity.key}
            activity={activity}
            index={index}
            activities={activities}
            errors={fieldErrors?.byKey?.[activity.key]}
            onChange={(patch) => onUpdateActivity(activity.key, patch)}
            onRemove={onRemoveActivity}
            canRemove={activities.length > 1}
            disabled={disabled}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddActivity}
        disabled={disabled}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
      >
        <Plus className="size-4" aria-hidden="true" />
        Agregar actividad
      </button>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label
          htmlFor="target-time"
          className="block text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Tiempo objetivo T
          <span className="ml-1 font-medium normal-case tracking-normal text-slate-400">
            (opcional)
          </span>
        </label>
        <input
          id="target-time"
          value={targetTime}
          onChange={(event) => onTargetTimeChange(event.target.value)}
          disabled={disabled}
          inputMode="decimal"
          placeholder="Ej. 13"
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-400"
        />
        <p className="mt-1 text-[11px] leading-4 text-slate-400">
          Se usa para calcular Z y P(T ≤ T). Debe cumplirse a ≤ m ≤ b.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Calculator className="size-4" aria-hidden="true" />
          )}
          Resolver
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Eraser className="size-4" aria-hidden="true" />
          Limpiar
        </button>
      </div>
    </form>
  )
}
