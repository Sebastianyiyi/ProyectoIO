import { ArrowLeft, ArrowRight, Network, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react'
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

const STAGES = ['Configuración CPM', 'Red AOA CPM', 'Tiempos y holguras CPM', 'Resumen CPM']

export function CpmWorkspace({ active = true }) {
  const solver = useCpmSolver()
  const [stage, setStage] = useState(1)
  const [mode, setMode] = useState('overview')
  const [speed, setSpeed] = useState(1)
  const [sidebar, setSidebar] = useState(true)
  const [fitRequest, setFitRequest] = useState(0)
  const [dismissed, setDismissed] = useState('')
  const { status } = useBackendHealth()
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-800">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white"><Network className="size-4" /></span>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Investigación de operaciones</p><h1 className="text-sm font-extrabold">CPM · Ruta crítica</h1></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status === 'online' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'offline' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{status === 'online' ? 'API conectada' : status === 'offline' ? 'API sin conexión' : 'Conectando con la API'}</span>
            <button type="button" onClick={loadExample} disabled={solver.loading} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Sparkles className="size-3.5" /> Cargar ejemplo CPM</button>
          </div>
        </div>
        <nav aria-label="Pasos de CPM" className="mt-3 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {STAGES.map((title, index) => <button key={title} type="button" onClick={() => setStage(index + 1)} disabled={index > 0 && !solver.result} aria-current={stage === index + 1 ? 'step' : undefined} className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-40 ${stage === index + 1 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><span className="mr-1.5">{index + 1}.</span>{title}</button>)}
        </nav>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {stage === 1 && <section aria-label="Configuración CPM" className="flex h-full flex-col overflow-y-auto p-4 sm:p-7">
          <div className="mx-auto my-auto w-full max-w-4xl space-y-4 py-3">
            <div><p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Paso 01 · CPM</p><h2 className="mt-1 text-xl font-black text-slate-900">Configuración de actividades CPM</h2><p className="mt-1 text-xs text-slate-500">Ingresa las actividades del proyecto, sus predecesores y su duración en días.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><CpmForm activities={solver.activities} loading={solver.loading} fieldErrors={solver.fieldErrors} onUpdate={solver.updateActivity} onAdd={solver.addActivity} onRemove={solver.removeActivity} onSolve={() => void solve()} onClear={clear} /></div>
          </div>
        </section>}

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
