import { CircleHelp } from 'lucide-react'
import { STEP_TYPES } from '../lib/constants'
import { formatStepValue } from '../lib/format'

export function StepDetails({ result, step, index, total }) {
  if (!step) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <CircleHelp className="size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Explicación del paso
          </h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Los pasos del algoritmo aparecerán aquí cuando el proyecto esté
          resuelto. Usa los controles para avanzar por el paso adelante, el paso
          atrás y la ruta crítica.
        </p>
      </section>
    )
  }

  const meta = STEP_TYPES[step.type] ?? STEP_TYPES.forward
  const node = result?.nodes?.find((item) => item.id === step.node_id)
  const earlyValue = formatStepValue('E', step.labels?.E)
  const lateValue = formatStepValue('L', step.labels?.L)

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${meta.badge}`}
          >
            {meta.label}
          </span>
          {node ? (
            <span className="text-xs font-semibold text-slate-400">
              Evento {node.event}
              {step.node_id ? ` · ${step.node_id}` : ''}
            </span>
          ) : null}
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Paso {index + 1} de {total}
        </span>
      </div>

      <p className={`mt-3 break-words font-mono text-sm font-bold leading-6 ${meta.accent}`}>
        {step.formula}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">{step.explanation}</p>

      {earlyValue || lateValue ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {earlyValue ? (
            <span className="rounded-lg bg-sky-50 px-2.5 py-1 font-mono text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-100">
              {earlyValue}
            </span>
          ) : null}
          {lateValue ? (
            <span className="rounded-lg bg-violet-50 px-2.5 py-1 font-mono text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-100">
              {lateValue}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
