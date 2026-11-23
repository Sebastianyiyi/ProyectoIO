import { Focus, Globe2 } from 'lucide-react'

const MODES = [
  {
    value: 'overview',
    label: 'Global',
    title: 'Visión global animada',
    icon: Globe2,
  },
  {
    value: 'focus',
    label: 'Enfoque',
    title: 'Paso a paso centrado',
    icon: Focus,
  },
]

export function ExecutionModeSwitch({ mode, onChange, disabled = false }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5"
      role="group"
      aria-label="Modo de ejecución"
    >
      {MODES.map((option) => {
        const Icon = option.icon
        const isActive = mode === option.value

        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              isActive
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-inset ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
