import {
  CheckCircle2,
  GitBranch,
  LayoutGrid,
  ListOrdered,
  Trophy,
} from 'lucide-react'

const STEPS = [
  {
    id: 'paso-1',
    num: '01',
    title: 'Configuración',
    subtitle: 'Actividades y tiempos',
    icon: LayoutGrid,
  },
  {
    id: 'paso-2',
    num: '02',
    title: 'Datos y Red AOA',
    subtitle: 'Tabla inicial y grafo',
    icon: GitBranch,
  },
  {
    id: 'paso-3',
    num: '03',
    title: 'Red y Cálculos',
    subtitle: 'Grafo y te, Ei, Lj, σ²',
    icon: ListOrdered,
  },
  {
    id: 'paso-4',
    num: '04',
    title: 'Resultados',
    subtitle: 'Ruta crítica y resumen',
    icon: Trophy,
  },
]

export function StepperNav({ activeStep, onStepClick, resultsAvailable = false }) {
  return (
    <nav
      aria-label="Progreso del proyecto PERT"
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEPS.map((step, idx) => {
            const stepIndex = idx + 1
            const isActive = activeStep === stepIndex
            const isCompleted = resultsAvailable && activeStep > stepIndex
            const isAvailable = stepIndex === 1 || resultsAvailable
            const Icon = step.icon

            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => isAvailable && onStepClick(stepIndex, step.id)}
                  disabled={!isAvailable}
                  className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm shadow-indigo-100 ring-2 ring-indigo-500/20'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-slate-700'
                        : isAvailable
                          ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          : 'cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-50'
                  }`}
                >
                  <div
                    className={`grid size-9 shrink-0 place-items-center rounded-lg text-xs font-black transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                        : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Paso {step.num}
                      </span>
                    </div>
                    <p
                      className={`truncate text-xs font-bold leading-tight ${
                        isActive
                          ? 'text-indigo-950'
                          : isCompleted
                            ? 'text-emerald-950'
                            : 'text-slate-800'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="hidden truncate text-[10px] text-slate-500 lg:block">
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
