import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  GitBranch,
  LayoutGrid,
  ListOrdered,
  Loader2,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Sparkles,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimationControls } from '../components/AnimationControls'
import { ErrorModal } from '../components/Feedback'
import { GraphLegend } from '../components/GraphLegend'
import { useAnimation } from '../hooks/useAnimation'
import { useBackendHealth } from '../hooks/useBackendHealth'
import { formatDuration } from '../lib/format'
import { CpmExecutiveReport } from './components/CpmExecutiveReport'
import { CpmForm } from './components/CpmForm'
import { CpmGraph } from './components/CpmGraph'
import { CpmResults } from './components/CpmResults'
import { CpmStepExplanation } from './components/CpmStepExplanation'
import { useCpmSolver } from './hooks/useCpmSolver'

const HEALTH_STYLES = {
  checking: {
    label: 'Conectando con la API',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Loader2,
    spin: true,
  },
  online: {
    label: 'API conectada',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: Wifi,
    spin: false,
  },
  offline: {
    label: 'API sin conexión',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: WifiOff,
    spin: false,
  },
}

const STAGES = [
  { id: 1, title: 'Configuración CPM', icon: LayoutGrid },
  { id: 2, title: 'Red AOA CPM', icon: GitBranch },
  { id: 3, title: 'Tiempos y holguras CPM', icon: ListOrdered },
  { id: 4, title: 'Resumen CPM', icon: Trophy },
]

export function CpmWorkspace({ active = true }) {
  const solver = useCpmSolver()
  const [stage, setStage] = useState(1)
  const [mode, setMode] = useState('overview')
  const [speed, setSpeed] = useState(1)
  const [sidebar, setSidebar] = useState(true)
  const [fitRequest, setFitRequest] = useState(0)
  const [dismissed, setDismissed] = useState('')
  const { status, check: checkHealth } = useBackendHealth()
  const health = HEALTH_STYLES[status] ?? HEALTH_STYLES.checking
  const HealthIcon = health.icon
  const steps = solver.result?.steps ?? []
  const animation = useAnimation(steps.length, 2400 / speed)
  const started = useRef(false)
  const resetAnimation = animation.reset
  const pauseAnimation = animation.pause
  const loadInitialExample = solver.loadExample

  useEffect(() => {
    if (started.current) return
    started.current = true
    void loadInitialExample()
  }, [loadInitialExample])

  useEffect(() => { resetAnimation() }, [resetAnimation, solver.result])
  useEffect(() => { if (!active) pauseAnimation() }, [active, pauseAnimation])
  useEffect(() => {
    if (stage !== 2) return undefined
    const timer = setTimeout(() => setFitRequest((value) => value + 1), 420)
    return () => clearTimeout(timer)
  }, [stage, sidebar, active])

  const messages = [
    ...solver.fieldErrors.general,
    ...Object.entries(solver.fieldErrors.byKey).map(([key, fields]) => {
      const activity = solver.activities.find((item) => item.key === key)
      return `Actividad ${activity?.id || 'sin identificador'}: ${Object.values(fields).join(' ')}`
    }),
    ...(solver.error ? [solver.error] : []),
  ]
  const errorKey = messages.join('|')

  async function solve() {
    setDismissed('')
    if (await solver.solve()) setStage(2)
  }

  function loadExample() {
    setDismissed('')
    setStage(1)
    void solver.loadExample()
  }

  function clear() {
    solver.clear()
    setStage(1)
    setDismissed('')
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased select-none">
      <header className="shrink-0 border-b border-slate-200/90 bg-white/95 backdrop-blur z-30">
        <div className="mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <Network className="size-4.5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  Investigación de Operaciones
                </span>
              </div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                CPM Lab <span className="text-[11px] font-normal text-slate-400">Ruta crítica</span>
              </h1>
            </div>
          </div>

          <nav
            aria-label="Pasos de CPM"
            className="hidden md:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner"
          >
            {STAGES.map((item) => {
              const isActive = stage === item.id
              const isPassed = Boolean(solver.result) && stage > item.id
              const isClickable = item.id === 1 || Boolean(solver.result)
              const StepIcon = item.icon

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => isClickable && setStage(item.id)}
                  disabled={!isClickable}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : isPassed
                        ? 'text-emerald-700 hover:text-emerald-900'
                        : isClickable
                          ? 'text-slate-500 hover:text-slate-800'
                          : 'cursor-not-allowed text-slate-400 opacity-50'
                  }`}
                >
                  <span
                    className={`grid size-4.5 place-items-center rounded-md text-[10px] font-black ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="size-3" aria-hidden="true" />
                    ) : (
                      <StepIcon className="size-2.5" aria-hidden="true" />
                    )}
                  </span>
                  <span>{item.title}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${health.className}`}
            >
              <HealthIcon
                className={`size-3 ${health.spin ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {health.label}
            </span>

            {status === 'offline' ? (
              <button
                type="button"
                onClick={() => void checkHealth()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="size-3" aria-hidden="true" />
                Reintentar
              </button>
            ) : null}

            <button
              type="button"
              onClick={loadExample}
              disabled={solver.loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {solver.loading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-3.5" aria-hidden="true" />
              )}
              Cargar ejemplo CPM
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {stage === 1 && (
          <section
            aria-label="Configuración CPM"
            className="h-full overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start"
          >
            <div className="w-full max-w-4xl space-y-4 my-auto py-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Paso 01 · Entrada de Datos
                  </span>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                    Configuración de Actividades CPM
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define la tabla matricial de actividades, predecesores y duración fija (en días).
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <CpmForm
                  activities={solver.activities}
                  loading={solver.loading}
                  fieldErrors={solver.fieldErrors}
                  onUpdate={solver.updateActivity}
                  onAdd={solver.addActivity}
                  onRemove={solver.removeActivity}
                  onSolve={() => void solve()}
                  onClear={clear}
                />
              </div>
            </div>
          </section>
        )}

        {stage === 2 && (
          <section aria-label="Red AOA CPM" className="flex h-full min-h-0 flex-col md:flex-row overflow-hidden">
            <aside
              id="cpm-aoa-activities-panel"
              className={`shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden shadow-xs z-10 transition-all duration-300 ${
                sidebar
                  ? 'h-[45%] w-full md:h-full md:w-[410px] xl:w-[450px]'
                  : 'h-0 w-full md:h-full md:w-0 border-r-0'
              }`}
            >
              <div className="shrink-0 flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-indigo-600" aria-hidden="true" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Actividades
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Paso 02
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-4">
                <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      Actividades
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200/60">
                      {solver.result.activities.length}{' '}
                      {solver.result.activities.length === 1 ? 'actividad' : 'actividades'}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm" aria-label="Datos iniciales CPM">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th scope="col" className="px-4 py-2.5 text-center w-16">
                            Act.
                          </th>
                          <th scope="col" className="px-4 py-2.5">
                            Predecesores
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right w-20">
                            Días
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {solver.result.activities.map((activity) => (
                          <tr key={activity.id} className="transition-colors hover:bg-slate-50/80">
                            <td className="px-4 py-2 text-center">
                              <span className="inline-grid size-7 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200/60">
                                {activity.id}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {activity.predecessors.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {activity.predecessors.map((predecessor) => (
                                    <span
                                      key={predecessor}
                                      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200"
                                    >
                                      {predecessor}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">
                                  — Inicio
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-xs font-semibold text-slate-700">
                              {formatDuration(activity.duration)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <CpmStepExplanation
                  step={steps[animation.index]}
                  index={animation.index}
                  total={steps.length}
                />
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStage(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  <span>Configuración (P1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage(3)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
                >
                  <span>Resultados (P3)</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </aside>

            <div className="flex-1 h-full min-h-0 min-w-0 bg-slate-100/70 relative flex flex-col overflow-hidden">
              <CpmGraph
                result={solver.result}
                step={steps[animation.index]}
                loading={solver.loading}
                executionMode={mode}
                onExecutionModeChange={setMode}
                fitRequest={fitRequest}
                headerActions={
                  <button
                    type="button"
                    onClick={() => setSidebar((value) => !value)}
                    aria-expanded={sidebar}
                    aria-controls="cpm-aoa-activities-panel"
                    title={sidebar ? 'Ocultar tabla de actividades' : 'Mostrar tabla de actividades'}
                    aria-label={sidebar ? 'Ocultar tabla de actividades' : 'Mostrar tabla de actividades'}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    {sidebar ? (
                      <PanelLeftClose className="size-4" aria-hidden="true" />
                    ) : (
                      <PanelLeftOpen className="size-4" aria-hidden="true" />
                    )}
                    <span className="hidden xl:inline">
                      {sidebar ? 'Ocultar tabla' : 'Mostrar tabla'}
                    </span>
                  </button>
                }
                topLeft={<GraphLegend showDimmed={mode === 'focus'} />}
                topRight={
                  <AnimationControls
                    index={animation.index}
                    total={steps.length}
                    isPlaying={animation.isPlaying}
                    isFirst={animation.isFirst}
                    isLast={animation.isLast}
                    speed={speed}
                    onSpeedChange={setSpeed}
                    onPrev={animation.prev}
                    onNext={animation.next}
                    onTogglePlay={animation.togglePlay}
                    onReset={animation.reset}
                    onGoToFinal={animation.goToFinal}
                  />
                }
              />
            </div>
          </section>
        )}

        {stage === 3 && <CpmResults result={solver.result} onPrev={() => setStage(2)} onNext={() => setStage(4)} />}
        {stage === 4 && <CpmExecutiveReport result={solver.result} onPrev={() => setStage(3)} onReset={() => setStage(1)} />}
      </main>

      <ErrorModal open={messages.length > 0 && dismissed !== errorKey} title="Revisa el proyecto CPM" messages={messages} onClose={() => setDismissed(errorKey)} />
    </div>
  )
}
