import cytoscape from 'cytoscape'
import nodeHtmlLabel from 'cytoscape-node-html-label'
import { Loader2, Network } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { formatLabelValue } from '../lib/format'
import { applyStepToGraph, buildGraphElements } from '../lib/graphElements'
import { graphStyles } from '../lib/graphStyles'

let labelsRegistered = false

function ensureLabelsRegistered() {
  if (!labelsRegistered) {
    nodeHtmlLabel(cytoscape)
    labelsRegistered = true
  }
}

function nodeTemplate(data) {
  return `
    <div class="aoa-node-label">
      <span class="aoa-node-label__value aoa-node-label__value--early">E ${formatLabelValue(data.E)}</span>
      <span class="aoa-node-label__event">${data.event}</span>
      <span class="aoa-node-label__value aoa-node-label__value--late">L ${formatLabelValue(data.L)}</span>
    </div>
  `
}

export function GraphCanvas({ result, step, loading }) {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const stepRef = useRef(step)

  useEffect(() => {
    stepRef.current = step
    if (cyRef.current) {
      applyStepToGraph(cyRef.current, step)
    }
  }, [step])

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

    const cy = cytoscape({
      container,
      elements: buildGraphElements(result),
      style: graphStyles,
      layout: { name: 'preset', fit: false, padding: 60 },
      minZoom: 0.25,
      maxZoom: 2.5,
      wheelSensitivity: 0.15,
      boxSelectionEnabled: false,
      autoungrabify: true,
    })

    cy.nodeHtmlLabel([
      {
        query: 'node',
        tpl: nodeTemplate,
      },
    ])

    cyRef.current = cy
    applyStepToGraph(cy, stepRef.current)

    const fit = () => {
      if (!cy.destroyed()) {
        cy.resize()
        cy.fit(cy.elements(), 60)
      }
    }

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(fit)
    } else {
      fit()
    }

    const observer = new ResizeObserver(() => {
      if (!cy.destroyed()) {
        cy.resize()
      }
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      cy.destroy()
      if (cyRef.current === cy) {
        cyRef.current = null
      }
    }
  }, [result])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Red AOA
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            E: tiempo temprano · L: tiempo tardío
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {result ? `${result.nodes.length} eventos · ${result.edges.length} arcos` : 'Sin proyecto'}
        </span>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="graph-canvas h-[min(66vh,720px)] min-h-[420px] w-full"
          role="img"
          aria-label="Red de actividades en los arcos del proyecto PERT"
        />

        {!result ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-50/80 p-6 text-center backdrop-blur-[1px]">
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
          <div className="absolute inset-0 grid place-items-center bg-white/65 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200">
              <Loader2 className="size-4 animate-spin text-indigo-600" aria-hidden="true" />
              Calculando red AOA…
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
