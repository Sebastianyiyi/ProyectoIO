import { lazy, Suspense, useEffect, useRef } from 'react'
import { ActivitiesTable } from './components/ActivitiesTable'
import { AnimationControls } from './components/AnimationControls'
import { AppHeader } from './components/AppHeader'
import { ErrorAlert } from './components/Feedback'
import { GraphLegend } from './components/GraphLegend'
import { ProbabilityCard } from './components/ProbabilityCard'
import { ProjectForm } from './components/ProjectForm'
import { ProjectSummary } from './components/ProjectSummary'
import { StepDetails } from './components/StepDetails'
import { useAnimation } from './hooks/useAnimation'
import { useBackendHealth } from './hooks/useBackendHealth'
import { usePertSolver } from './hooks/usePertSolver'
import { ANIMATION_INTERVAL_MS } from './lib/constants'

const GraphCanvas = lazy(() =>
  import('./components/GraphCanvas').then((module) => ({
    default: module.GraphCanvas,
  })),
)

function GraphFallback() {
  return (
    <div className="grid h-[min(66vh,720px)] min-h-[420px] place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <p className="text-sm font-semibold text-slate-400">
        Cargando visualizador de red…
      </p>
    </div>
  )
}

function App() {
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

  const steps = result?.steps ?? []
  const animation = useAnimation(steps.length, ANIMATION_INTERVAL_MS)
  const currentStep = steps[animation.index] ?? null
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

  const busy = loading || exampleLoading

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eef2ff,_transparent_38%),radial-gradient(circle_at_top_right,_#ecfdf5,_transparent_32%)]">
      <AppHeader
        healthStatus={healthStatus}
        onRetryHealth={() => void checkHealth()}
        onLoadExample={() => void loadExample()}
        loading={busy}
      />

      <main className="mx-auto grid max-w-[1800px] gap-4 px-4 pb-6 pt-4 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-[4.75rem] lg:max-h-[calc(100vh-5.75rem)] lg:overflow-y-auto lg:pr-1">
          <ProjectForm
            activities={activities}
            targetTime={targetTime}
            onTargetTimeChange={setTargetTime}
            onUpdateActivity={updateActivity}
            onAddActivity={addActivity}
            onRemoveActivity={removeActivity}
            onSolve={() => void solve()}
            onClear={clearProject}
            loading={busy}
            fieldErrors={fieldErrors}
          />

          <ErrorAlert
            message={error}
            onRetry={healthStatus === 'offline' ? () => void loadExample() : undefined}
          />

          {result ? (
            <>
              <ProjectSummary result={result} />
              <ActivitiesTable result={result} />
              <ProbabilityCard result={result} />
            </>
          ) : null}
        </aside>

        <section className="min-w-0 space-y-3">
          <Suspense fallback={<GraphFallback />}>
            <GraphCanvas result={result} step={currentStep} loading={loading} />
          </Suspense>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-start">
            <StepDetails
              result={result}
              step={currentStep}
              index={animation.index}
              total={steps.length}
            />

            <div className="space-y-3">
              <AnimationControls
                index={animation.index}
                total={steps.length}
                isPlaying={animation.isPlaying}
                isFirst={animation.isFirst}
                isLast={animation.isLast}
                onPrev={animation.prev}
                onNext={animation.next}
                onTogglePlay={animation.togglePlay}
                onReset={animation.reset}
                onGoToFinal={animation.goToFinal}
              />
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                <GraphLegend />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
