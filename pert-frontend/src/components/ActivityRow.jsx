import { Trash2 } from 'lucide-react'
import { PredecessorPicker } from './PredecessorPicker'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400'

const numberClass = `${inputClass} text-center font-mono`

function fieldId(activityKey, field) {
  return `activity-${activityKey}-${field}`
}

export function ActivityRow({
  activity,
  index,
  activities,
  errors,
  onChange,
  onRemove,
  canRemove,
  disabled,
}) {
  const error = errors ?? {}
  const idInputId = fieldId(activity.key, 'id')
  const nameInputId = fieldId(activity.key, 'name')
  const predecessorsId = fieldId(activity.key, 'predecessors')
  const aInputId = fieldId(activity.key, 'a')
  const mInputId = fieldId(activity.key, 'm')
  const bInputId = fieldId(activity.key, 'b')

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          <span className="grid size-5 place-items-center rounded-full bg-slate-100 text-[10px] text-slate-600">
            {index + 1}
          </span>
          Actividad
        </span>
        <button
          type="button"
          onClick={() => onRemove(activity.key)}
          disabled={!canRemove || disabled}
          title={canRemove ? 'Eliminar actividad' : 'Debe existir al menos una actividad'}
          aria-label={`Eliminar actividad ${activity.id || index + 1}`}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Quitar
        </button>
      </div>

      <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-2">
        <div>
          <label
            htmlFor={idInputId}
            className="mb-1 block text-[11px] font-semibold text-slate-500"
          >
            ID
          </label>
          <input
            id={idInputId}
            value={activity.id}
            onChange={(event) => onChange({ id: event.target.value })}
            disabled={disabled}
            aria-invalid={Boolean(error.id)}
            aria-describedby={error.id ? `${idInputId}-error` : undefined}
            placeholder="A"
            className={inputClass}
            maxLength={40}
          />
        </div>

        <div>
          <label
            htmlFor={nameInputId}
            className="mb-1 block text-[11px] font-semibold text-slate-500"
          >
            Nombre
          </label>
          <input
            id={nameInputId}
            value={activity.name}
            onChange={(event) => onChange({ name: event.target.value })}
            disabled={disabled}
            placeholder="Definir requerimientos"
            className={inputClass}
            maxLength={120}
          />
        </div>
      </div>

      {error.id ? (
        <p id={`${idInputId}-error`} className="mt-1 text-xs font-medium text-rose-600">
          {error.id}
        </p>
      ) : null}

      <div className="mt-3">
        <span
          id={predecessorsId}
          className="mb-1.5 block text-[11px] font-semibold text-slate-500"
        >
          Predecesores inmediatos
        </span>
        <PredecessorPicker
          activityKey={activity.key}
          activities={activities}
          selected={activity.predecessors}
          onChange={(predecessors) => onChange({ predecessors })}
          disabled={disabled}
        />
        {error.predecessors ? (
          <p className="mt-1 text-xs font-medium text-rose-600">
            {error.predecessors}
          </p>
        ) : null}
      </div>

      <div className="mt-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label
              htmlFor={aInputId}
              className="mb-1 block text-[11px] font-semibold text-slate-500"
              title="Tiempo optimista"
            >
              a
            </label>
            <input
              id={aInputId}
              value={activity.a}
              onChange={(event) => onChange({ a: event.target.value })}
              disabled={disabled}
              inputMode="decimal"
              aria-invalid={Boolean(error.a || error.time)}
              aria-describedby={error.a ? `${aInputId}-error` : undefined}
              placeholder="0"
              className={numberClass}
            />
          </div>
          <div>
            <label
              htmlFor={mInputId}
              className="mb-1 block text-[11px] font-semibold text-slate-500"
              title="Tiempo más probable"
            >
              m
            </label>
            <input
              id={mInputId}
              value={activity.m}
              onChange={(event) => onChange({ m: event.target.value })}
              disabled={disabled}
              inputMode="decimal"
              aria-invalid={Boolean(error.m || error.time)}
              aria-describedby={error.m ? `${mInputId}-error` : undefined}
              placeholder="0"
              className={numberClass}
            />
          </div>
          <div>
            <label
              htmlFor={bInputId}
              className="mb-1 block text-[11px] font-semibold text-slate-500"
              title="Tiempo pesimista"
            >
              b
            </label>
            <input
              id={bInputId}
              value={activity.b}
              onChange={(event) => onChange({ b: event.target.value })}
              disabled={disabled}
              inputMode="decimal"
              aria-invalid={Boolean(error.b || error.time)}
              aria-describedby={error.b ? `${bInputId}-error` : undefined}
              placeholder="0"
              className={numberClass}
            />
          </div>
        </div>

        {error.a ? (
          <p id={`${aInputId}-error`} className="mt-1 text-xs font-medium text-rose-600">
            {error.a}
          </p>
        ) : null}
        {error.m ? (
          <p id={`${mInputId}-error`} className="mt-1 text-xs font-medium text-rose-600">
            {error.m}
          </p>
        ) : null}
        {error.b ? (
          <p id={`${bInputId}-error`} className="mt-1 text-xs font-medium text-rose-600">
            {error.b}
          </p>
        ) : null}
        {error.time ? (
          <p className="mt-1 text-xs font-medium text-rose-600">{error.time}</p>
        ) : null}
      </div>
    </article>
  )
}
