import cytoscape from 'cytoscape'
import cytoscapeDagre from 'cytoscape-dagre'
import nodeHtmlLabel from 'cytoscape-node-html-label'
import { Loader2, Network } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { applyEdgeLabelLayout } from '../../lib/edgeLabelLayout'
import { formatLabelValue } from '../../lib/format'
import { applyStepToGraph, buildGraphElements } from '../../lib/graphElements'
import { graphStyles } from '../../lib/graphStyles'
import {
  FOCUS_PADDING,
  FOCUS_PADDING_TOP,
  FOCUS_ZOOM_MAX,
  FOCUS_ZOOM_MIN,
  FIT_PADDING,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  animateViewport,
  clampZoom,
  fitElements,
  getViewportForElements,
  getWheelZoomFactor,
  getZoomedViewportAroundCenter,
} from '../../lib/graphView'
import { ExecutionModeSwitch } from '../../components/ExecutionModeSwitch'
import { GraphToolbar } from '../../components/GraphToolbar'

const DAGRE_LAYOUT = {
  name: 'dagre',
  rankDir: 'LR',
  rankSep: 120,
  nodeSep: 80,
  edgeSep: 20,
  animate: false,
  fit: false,
}

let labelsRegistered = false
let layoutRegistered = false

function ensureLabelsRegistered() {
  if (!labelsRegistered) {
    nodeHtmlLabel(cytoscape)
    labelsRegistered = true
  }
}

function ensureLayoutRegistered() {
  if (!layoutRegistered) {
    cytoscapeDagre(cytoscape)
    layoutRegistered = true
  }
}

function runLayout(cy) {
  try {
    cy.layout(DAGRE_LAYOUT).run()
  } catch {
    fitElements(cy, cy.elements(), { animate: false })
  }
}

function nodeTemplate(data) {
  const stateClasses = [
    data.dimmed ? 'aoa-node-label--dimmed' : '',
    data.active ? 'aoa-node-label--active' : '',
    data.settled ? 'aoa-node-label--settled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return `
    <div class="aoa-node-label ${stateClasses}">
      <span class="aoa-node-label__pulse"></span>
      <span class="aoa-node-label__chip aoa-node-label__chip--early">
        <span class="aoa-node-label__key">E</span>
        <span class="aoa-node-label__value">${formatLabelValue(data.E)}</span>
      </span>
      <span class="aoa-node-label__event">${data.event}</span>
      <span class="aoa-node-label__chip aoa-node-label__chip--late">
        <span class="aoa-node-label__key">L</span>
        <span class="aoa-node-label__value">${formatLabelValue(data.L)}</span>
      </span>
    </div>
  `
}

function buildFocusCollection(cy, step) {
  const collection = cy.collection()
  const ids = new Set([...(step?.highlight_nodes ?? []), step?.node_id].filter(Boolean))

  for (const nodeId of ids) {
    const node = cy.getElementById(nodeId)
    if (node.length > 0) {
      collection.merge(node)
    }
  }

  for (const edgeId of step?.highlight_edges ?? []) {
    const edge = cy.getElementById(edgeId)
    if (edge.length > 0) {
      collection.merge(edge)
      collection.merge(edge.source())
      collection.merge(edge.target())
    }
  }

  return collection
}

function focusOnStep(cy, step) {
  if (!cy || cy.destroyed() || !step) {
    return
  }

  const focus = buildFocusCollection(cy, step)
  const target = focus.length > 0 ? focus : cy.elements()
  const viewport = getViewportForElements(cy, target, {
    padding: FOCUS_PADDING,
    paddingTop: FOCUS_PADDING_TOP,
    minZoom: FOCUS_ZOOM_MIN,
    maxZoom: FOCUS_ZOOM_MAX,
  })

  animateViewport(cy, viewport)
}

export function CpmGraph({
  result,
  step,
  loading,
  _speed = 1,
  executionMode = 'overview',
  onExecutionModeChange,
  fitRequest = 0,
  headerActions = null,
  topLeft = null,
  topCenter = null,
  topRight = null,
}) {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const cyRef = useRef(null)
  const stepRef = useRef(step)
  const modeRef = useRef(executionMode)

  useEffect(() => {
    const cy = cyRef.current
    const previousMode = modeRef.current
    stepRef.current = step
    modeRef.current = executionMode

    if (!cy) {
      return
    }

    applyStepToGraph(cy, step, {
      result,
      mode: executionMode,
    })

    if (executionMode === 'focus' && step) {
      focusOnStep(cy, step)
    } else if (previousMode === 'focus' && executionMode === 'overview') {
      fitElements(cy, cy.elements(), { animate: true })
    }
  }, [executionMode, result, step])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }

    if (!result) {
      container.replaceChildren()
      return undefined
    }

    ensureLabelsRegistered()
    ensureLayoutRegistered()

    const cy = cytoscape({
      container,
      elements: buildGraphElements(result),
      style: graphStyles,
      layout: { name: 'preset', fit: false, padding: FIT_PADDING },
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      userZoomingEnabled: false,
      userPanningEnabled: true,
      autoungrabify: false,
      boxSelectionEnabled: false,
    })

    cy.nodeHtmlLabel([
      {
        query: 'node',
        tpl: nodeTemplate,
      },
    ])

    cyRef.current = cy
    cy.resize()
    runLayout(cy)
    applyEdgeLabelLayout(cy)
    applyStepToGraph(cy, stepRef.current, {
      result,
      mode: modeRef.current,
    })

    const initialFit = () => {
      if (cy.destroyed()) {
        return
      }

      cy.resize()
      fitElements(cy, cy.elements(), { animate: false })
      if (modeRef.current === 'focus' && stepRef.current) {
        focusOnStep(cy, stepRef.current)
      }
    }

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(initialFit)
    } else {
      initialFit()
    }

    const handleWheel = (event) => {
      if (cy.destroyed()) {
        return
      }

      event.preventDefault()
      const factor = getWheelZoomFactor(
        event.deltaY,
        event.deltaMode,
        container.clientHeight,
      )
      const currentZoom = cy.zoom()
      const level = clampZoom(currentZoom * factor)

      if (Math.abs(level - currentZoom) < 0.0001) {
        return
      }

      const rect = container.getBoundingClientRect()
      cy.zoom({
        level,
        renderedPosition: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    let resizeTimer = null
    const observer = new ResizeObserver(() => {
      if (cy.destroyed()) {
        return
      }

      cy.resize()
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (cy.destroyed()) {
          return
        }

        if (modeRef.current === 'focus' && stepRef.current) {
          focusOnStep(cy, stepRef.current)
        } else {
          fitElements(cy, cy.elements(), { animate: true })
        }
      }, 160)
    })
    observer.observe(container)

    return () => {
      window.clearTimeout(resizeTimer)
      observer.disconnect()
      container.removeEventListener('wheel', handleWheel)
      cy.destroy()
      if (cyRef.current === cy) {
        cyRef.current = null
      }
    }
  }, [result])

  useEffect(() => {
    if (!fitRequest) {
      return undefined
    }

    const cy = cyRef.current
    if (!cy) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      if (!cy.destroyed()) {
        cy.resize()
        if (modeRef.current === 'focus' && stepRef.current) {
          focusOnStep(cy, stepRef.current)
        } else {
          fitElements(cy, cy.elements(), { animate: true })
        }
      }
    }, 330)

    return () => window.clearTimeout(timer)
  }, [fitRequest])

  function zoomIn() {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) {
      return
    }

    const next = clampZoom(cy.zoom() * (1 + ZOOM_STEP))
    animateViewport(cy, getZoomedViewportAroundCenter(cy, next))
  }

  function zoomOut() {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) {
      return
    }

    const next = clampZoom(cy.zoom() * (1 - ZOOM_STEP))
    animateViewport(cy, getZoomedViewportAroundCenter(cy, next))
  }

  function fitToView() {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) {
      return
    }

    fitElements(cy, cy.elements(), { animate: true })
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            CPM · Lienzo de Red AOA
          </h2>
          <p className="text-[11px] text-slate-400">
            E: tiempo temprano · L: tiempo tardío
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {headerActions}
          <ExecutionModeSwitch
            mode={executionMode}
            onChange={onExecutionModeChange}
            disabled={!result || loading}
          />
          {result ? (
            <GraphToolbar
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFit={fitToView}
              disabled={loading}
            />
          ) : null}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 w-full">
        <div
          ref={containerRef}
          className="graph-canvas h-full w-full"
          role="img"
          aria-label={'Red de actividades en los arcos del proyecto CPM'}
        />

        {result && (topLeft || topCenter || topRight) ? (
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start gap-2"
          >
            <div>{topLeft}</div>
            <div className="pointer-events-auto order-2 ml-auto xl:order-3">
              {topRight}
            </div>
            {topCenter ? (
              <div className="order-3 flex w-full justify-center xl:order-2 xl:w-auto xl:flex-1">
                {topCenter}
              </div>
            ) : null}
          </div>
        ) : null}


        {!result ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-slate-50/80 p-6 text-center backdrop-blur-[1px]">
            <div className="max-w-sm">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-inset ring-slate-200">
                <Network className="size-6" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Aún no hay una red para mostrar
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Carga el ejemplo o define las actividades y pulsa Resolver para
                construir la red AOA.
              </p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-white/65 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200">
              <Loader2
                className="size-4 animate-spin text-indigo-600"
                aria-hidden="true"
              />
              Calculando red AOA…
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
