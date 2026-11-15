import {
  ArrowLeft,
  ArrowRight,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimationControls } from './components/AnimationControls'
import { AppHeader } from './components/AppHeader'
import { CriticalPathExecutiveReport } from './components/CriticalPathExecutiveReport'
import { ErrorModal } from './components/Feedback'
import { GraphLegend } from './components/GraphLegend'
import { InitialDataTable } from './components/InitialDataTable'
import { ProjectForm } from './components/ProjectForm'
import { Step3ProbabilisticAndCalculations } from './components/Step3ProbabilisticAndCalculations'
import { useAnimation } from './hooks/useAnimation'
import { useBackendHealth } from './hooks/useBackendHealth'
import { usePertSolver } from './hooks/usePertSolver'
import {
  ANIMATION_INTERVAL_MS,
  ANIMATION_SPEED_DEFAULT,
} from './lib/constants'

const GraphCanvas = lazy(() =>
  import('./components/GraphCanvas').then((module) => ({
    default: module.GraphCanvas,
  })),
)

function GraphFallback() {
  return (
    <div className="grid h-full w-full place-items-center bg-slate-50">
      <p className="text-xs font-semibold text-slate-400">
        Cargando lienzo de red AOA…
      </p>
    </div>
  )
}

export function App() {
  const {
    activities,
    targetTime,
    result,
    loading,
    exampleLoading,
    error,
    fieldErrors,
    setTargetTime,
    solve,
    loadExample,
    clearProject,
    updateActivity,
    addActivity,
    removeActivity,
  } = usePertSolver()

  const { status: healthStatus, check: checkHealth } = useBackendHealth()
  const [currentStep, setCurrentStep] = useState(1)
  const [executionMode, setExecutionMode] = useState('overview')
  const [animationSpeed, setAnimationSpeed] = useState(ANIMATION_SPEED_DEFAULT)
  const [fitRequest, setFitRequest] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [dismissedErrorKey, setDismissedErrorKey] = useState(null)

  const generalErrors = fieldErrors?.general ?? []
  const fieldErrorMessages = Object.entries(fieldErrors?.byKey ?? {}).map(
    ([key, messages]) => {
      const index = activities.findIndex((activity) => activity.key === key)
      const activityId = String(activities[index]?.id ?? '').trim()
      const label = activityId
        ? `Actividad ${activityId}`
        : `Actividad ${index >= 0 ? index + 1 : '—'}`
      const details = [...new Set(Object.values(messages ?? {}).filter(Boolean))]
      return `${label}: ${details.join(' ')}`
    },
  )
  const validationMessages = [...generalErrors, ...fieldErrorMessages]
  const errorMessages =
    validationMessages.length > 0
      ? validationMessages
      : error
        ? [error]
        : []
  const errorKey = `${error ?? ''}|${errorMessages.join('|')}`
  const errorModalOpen =
    errorMessages.length > 0 && dismissedErrorKey !== errorKey
  const errorTitle =
    validationMessages.length > 0
      ? 'Revisa los datos del proyecto'
      : 'No se pudo completar la operación'

  const steps = result?.steps ?? []
  const animation = useAnimation(
    steps.length,
    ANIMATION_INTERVAL_MS / animationSpeed,
  )
  const currentStepData = steps[animation.index] ?? null
  const startedRef = useRef(false)
  const resetAnimation = animation.reset

  useEffect(() => {
    if (startedRef.current) {
      return
    }

    startedRef.current = true
    void loadExample()
  }, [loadExample])

  useEffect(() => {
    resetAnimation()
  }, [resetAnimation, result])

  useEffect(() => {
    if (currentStep !== 2) {
      return undefined
    }

    const timer = window.setTimeout(
      () => setFitRequest((count) => count + 1),
      420,
    )
    return () => window.clearTimeout(timer)
  }, [currentStep, result, sidebarVisible])

  const busy = loading || exampleLoading

  function handleStepChange(stepNumber) {
    setCurrentStep(stepNumber)
  }

  function toggleActivitiesSidebar() {
    setSidebarVisible((visible) => !visible)
  }

  function closeErrorModal() {
    setDismissedErrorKey(errorKey)
  }

  async function handleSolveAndProceed() {
    setDismissedErrorKey(null)
    const data = await solve()
    if (data) {
      setCurrentStep(2)
    }
    return data
  }

  async function handleLoadExample() {
    setDismissedErrorKey(null)
    return loadExample()
  }

  function handleClear() {
    setDismissedErrorKey(null)
    clearProject()
    setCurrentStep(1)
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 font-sans text-slate-800 antialiased select-none">
      {/* Top Header with 4-Step Navigation */}
      <AppHeader
        healthStatus={healthStatus}
        onRetryHealth={() => void checkHealth()}
        onLoadExample={() => void handleLoadExample()}
        loading={busy}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        resultsAvailable={Boolean(result)}
      />

      {/* Wizard Carousel Container: 4 Horizontal Slides with 0.4s transition */}
      <div className="flex-1 w-full overflow-hidden relative">
        <div
          className="flex h-full w-[400%] transition-transform duration-400 ease-in-out"
          style={{
            transform: `translateX(-${(currentStep - 1) * 25}%)`,
            transitionDuration: '400ms',
          }}
        >
          {/* ======================================================== */}
          {/* PASO 1: CONFIGURACIÓN DE DATOS (ENTRADA DE ACTIVIDADES)  */}
          {/* ======================================================== */}
          <div className="w-1/4 h-full overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start">
            <div className="w-full max-w-4xl space-y-4 my-auto py-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Paso 01 · Entrada de Datos
                  </span>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                    Configuración de Actividades del Proyecto
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define la tabla matricial de actividades, predecesores y tiempos (a, m, b).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleLoadExample()}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  Cargar ejemplo
                </button>
              </div>

              {/* Formulario de tabla editable compacta */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <ProjectForm
                  activities={activities}
                  targetTime={targetTime}
                  onTargetTimeChange={setTargetTime}
                  onUpdateActivity={updateActivity}
                  onAddActivity={addActivity}
                  onRemoveActivity={removeActivity}
                  onSolve={() => void handleSolveAndProceed()}
                  onClear={handleClear}
                  loading={busy}
                  fieldErrors={fieldErrors}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PASO 2: RED AOA Y TABLA INICIAL (COMBINADA / SPLIT)      */}
          {/* ======================================================== */}
          <div className="w-1/4 h-full flex flex-row overflow-hidden border-r border-slate-200">
            {/* Columna Izquierda: Tabla Inicial de Datos Ingresados */}
            <aside
              id="aoa-activities-panel"
              className={`shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden shadow-xs z-10 transition-all duration-300 ${sidebarVisible ? 'w-[410px] xl:w-[450px]' : 'w-0 border-r-0'}`}
            >
              <div className="shrink-0 flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Actividades
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Paso 02
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                <InitialDataTable activities={activities} result={result} />
              </div>

              {/* Controles de navegación en el pie del sidebar */}
              <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleStepChange(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Configuración (P1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStepChange(3)}
                  disabled={!result}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-40"
                >
                  <span>Resultados (P3)</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </aside>


            {/* Columna Derecha: Lienzo del Grafo Cytoscape SIN TARJETA FLOTANTE DE RUTA CRÍTICA */}
            <main className="flex-1 h-full min-w-0 bg-slate-100/70 relative flex flex-col overflow-hidden">
              <Suspense fallback={<GraphFallback />}>
                <GraphCanvas
                  result={result}
                  step={currentStepData}
                  loading={loading}
                  speed={animationSpeed}
                  executionMode={executionMode}
                  onExecutionModeChange={setExecutionMode}
                  fitRequest={fitRequest}
                  headerActions={
                    <button
                      type="button"
                      onClick={toggleActivitiesSidebar}
                      aria-expanded={sidebarVisible}
                      aria-controls="aoa-activities-panel"
                      title={
                        sidebarVisible
                          ? 'Ocultar tabla de actividades'
                          : 'Mostrar tabla de actividades'
                      }
                      aria-label={
                        sidebarVisible
                          ? 'Ocultar tabla de actividades'
                          : 'Mostrar tabla de actividades'
                      }
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                    >
                      {sidebarVisible ? (
                        <PanelLeftClose className="size-4" aria-hidden="true" />
                      ) : (
                        <PanelLeftOpen className="size-4" aria-hidden="true" />
                      )}
                      <span className="hidden xl:inline">
                        {sidebarVisible ? 'Ocultar tabla' : 'Mostrar tabla'}
                      </span>
                    </button>
                  }
                  topLeft={
                    <GraphLegend showDimmed={executionMode === 'focus'} />
                  }
                  topCenter={null} /* OBLIGATORIO: Se remueve la tarjeta flotante amarilla de ruta crítica */
                  topRight={
                    result ? (
                      <AnimationControls
                        index={animation.index}
                        total={steps.length}
                        isPlaying={animation.isPlaying}
                        isFirst={animation.isFirst}
                        isLast={animation.isLast}
                        speed={animationSpeed}
                        onSpeedChange={setAnimationSpeed}
                        onPrev={animation.prev}
                        onNext={animation.next}
                        onTogglePlay={animation.togglePlay}
                        onReset={animation.reset}
                        onGoToFinal={animation.goToFinal}
                      />
                    ) : null
                  }
                />
              </Suspense>
            </main>
          </div>

          {/* ======================================================== */}
          {/* PASO 3: RESULTADOS COMPLETOS Y PROBABILIDAD DEL PROYECTO */}
          {/* ======================================================== */}
          <div className="w-1/4 h-full overflow-hidden bg-slate-50">
            <Step3ProbabilisticAndCalculations
              result={result}
              onPrev={() => handleStepChange(2)}
              onNext={() => handleStepChange(4)}
            />
          </div>

          {/* ======================================================== */}
          {/* PASO 4: RESUMEN EJECUTIVO Y SECUENCIA DE LA RUTA CRÍTICA */}
          {/* ======================================================== */}
          <div className="w-1/4 h-full overflow-hidden bg-slate-50">
            <CriticalPathExecutiveReport
              result={result}
              onPrev={() => handleStepChange(3)}
              onReset={() => handleStepChange(1)}
            />
          </div>
        </div>
      </div>

      <ErrorModal
        open={errorModalOpen}
        title={errorTitle}
        messages={errorMessages}
        onClose={closeErrorModal}
        onRetry={
          healthStatus === 'offline'
            ? () => {
                closeErrorModal()
                void handleLoadExample()
              }
            : undefined
        }
      />
    </div>
  )
}

export default App
