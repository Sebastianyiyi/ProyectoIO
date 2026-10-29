export function PredecessorPicker({
  activityKey,
  activities,
  selected,
  onChange,
  disabled,
}) {
  const options = []
  const seen = new Set()

  for (const activity of activities) {
    const id = String(activity.id ?? '').trim()
    if (!id || activity.key === activityKey || seen.has(id)) {
      continue
    }

    seen.add(id)
    options.push({ id, name: String(activity.name ?? '').trim() })
  }

  if (options.length === 0) {
    return (
      <p className="text-xs leading-5 text-slate-400">
        Asigna identificadores a otras actividades para habilitar dependencias.
      </p>
    )
  }

  const selectedIds = new Set((selected ?? []).map((id) => String(id).trim()))

  const toggle = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }

    onChange(Array.from(next))
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Predecesores inmediatos">
      {options.map((option) => {
        const isSelected = selectedIds.has(option.id)

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => toggle(option.id)}
            title={option.name || option.id}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              isSelected
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            } disabled:opacity-50`}
          >
            {option.id}
          </button>
        )
      })}
    </div>
  )
}
