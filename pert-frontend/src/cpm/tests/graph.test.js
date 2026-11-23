import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { describe, expect, it } from 'vitest'
import { applyEdgeLabelLayout } from '../../lib/edgeLabelLayout'
import { applyStepToGraph, buildGraphElements } from '../../lib/graphElements'
import { curveCpmSkipEdges, expandCpmParallelNodes } from '../lib/cpmGraphLayout'
import fixtures from './fixtures/projects.json'

cytoscape.use(dagre)

describe('CPM graph contract', () => {
  it('lays out the CPM example and applies the animation snapshots', () => {
    const result = fixtures.cpm.result
    const cy = cytoscape({ headless: true, elements: buildGraphElements(result) })
    try {
      cy.layout({ name: 'dagre', rankDir: 'LR', rankSep: 140, nodeSep: 120, edgeSep: 36 }).run()
      expandCpmParallelNodes(cy)
      applyEdgeLabelLayout(cy)
      curveCpmSkipEdges(cy)
      expect(cy.nodes().length).toBe(result.nodes.length)
      expect(cy.edges().length).toBe(result.edges.length)
      expect(cy.nodes().every((node) => Number.isFinite(node.position('x')) && Number.isFinite(node.position('y')))).toBe(true)
      expect(cy.edges().every((edge) => edge.source().position('x') < edge.target().position('x'))).toBe(true)
      const skipEdge = cy.edges().filter((edge) => edge.data('activityId') === 'B')
      expect(skipEdge.hasClass('is-curved')).toBe(true)
      expect(Math.abs(skipEdge.data('controlPointDistance'))).toBeGreaterThanOrEqual(140)
      applyStepToGraph(cy, result.steps[0], { result, mode: 'overview' })
      expect(cy.nodes().filter((node) => node.data('E') !== null).length).toBe(1)
      expect(cy.nodes().every((node) => node.data('L') === null)).toBe(true)
      applyStepToGraph(cy, result.steps.at(-1), { result, mode: 'overview' })
      for (const node of result.nodes) {
        expect(cy.getElementById(node.id).data('E')).toBe(node.E)
        expect(cy.getElementById(node.id).data('L')).toBe(node.L)
      }
      const dummies = result.edges.filter((edge) => edge.is_dummy)
      expect(cy.edges('.is-dummy').length).toBe(dummies.length)
      for (const edge of dummies) {
        expect(edge.duration).toBe(0)
        expect(cy.getElementById(edge.id).data('label')).toBe(edge.label)
      }
      for (const edge of result.edges) {
        expect(cy.getElementById(edge.id).hasClass('is-critical')).toBe(edge.is_critical)
      }
    } finally {
      cy.destroy()
    }
  })
})
