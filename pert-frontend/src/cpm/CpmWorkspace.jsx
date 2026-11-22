import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
    const timer = setTimeout(() => setFitRequest((value) => value + 1), 150)
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

        {stage === 2 && <section aria-label="Red AOA CPM" className="flex h-full min-h-0 flex-col md:flex-row">
          <aside className={`shrink-0 overflow-hidden border-r border-slate-200 bg-white ${sidebar ? 'h-[45%] w-full md:h-full md:w-[350px] xl:w-[390px]' : 'h-0 w-full md:h-full md:w-0'}`}>
            <div className="flex h-full flex-col">
              <h2 className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide">Actividades y procedimiento CPM</h2>
              <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
                <table className="w-full text-left text-xs" aria-label="Datos iniciales CPM">
                  <thead className="border-b border-slate-100 text-[10px] uppercase text-slate-500"><tr><th scope="col" className="px-2 py-2">Act.</th><th scope="col" className="px-2 py-2">Pred.</th><th scope="col" className="px-2 py-2 text-right">Días</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{solver.result.activities.map((activity) => <tr key={activity.id}><td className="px-2 py-2 font-extrabold text-indigo-700">{activity.id}</td><td className="px-2 py-2 text-slate-600">{activity.predecessors.join(', ') || '—'}</td><td className="px-2 py-2 text-right font-mono">{formatDuration(activity.duration)}</td></tr>)}</tbody>
                </table>
                <CpmStepExplanation step={steps[animation.index]} index={animation.index} total={steps.length} />
              </div>
              <div className="flex shrink-0 justify-between gap-2 border-t border-slate-200 p-3">
                <button type="button" onClick={() => setStage(1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold"><ArrowLeft className="size-3.5" /> Configuración</button>
                <button type="button" onClick={() => setStage(3)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-2 text-xs font-bold text-white">Resultados <ArrowRight className="size-3.5" /></button>
              </div>
            </div>
          </aside>
          <div className="min-h-0 min-w-0 flex-1">
            <CpmGraph result={solver.result} step={steps[animation.index]} loading={solver.loading} executionMode={mode} onExecutionModeChange={setMode} fitRequest={fitRequest}
              headerActions={<button type="button" onClick={() => setSidebar((value) => !value)} aria-label={sidebar ? 'Ocultar actividades CPM' : 'Mostrar actividades CPM'} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600">{sidebar ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}</button>}
              topLeft={<GraphLegend showDimmed={mode === 'focus'} />}
              topRight={<AnimationControls index={animation.index} total={steps.length} isPlaying={animation.isPlaying} isFirst={animation.isFirst} isLast={animation.isLast} speed={speed} onSpeedChange={setSpeed} onPrev={animation.prev} onNext={animation.next} onTogglePlay={animation.togglePlay} onReset={animation.reset} onGoToFinal={animation.goToFinal} />}
            />
          </div>
        </section>}

        {stage === 3 && <CpmResults result={solver.result} onPrev={() => setStage(2)} onNext={() => setStage(4)} />}
        {stage === 4 && <CpmExecutiveReport result={solver.result} onPrev={() => setStage(3)} onReset={() => setStage(1)} />}
      </main>

      <ErrorModal open={messages.length > 0 && dismissed !== errorKey} title="Revisa el proyecto CPM" messages={messages} onClose={() => setDismissed(errorKey)} />
    </div>
  )
}
