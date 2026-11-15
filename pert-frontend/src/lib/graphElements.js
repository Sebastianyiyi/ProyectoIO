import { getStepVisibility } from './graphVisibility'

export function buildGraphElements(result) {
  if (!result) {
    return []
  }

  const nodes = result.nodes.map((node) => ({
    group: 'nodes',
    data: {
      id: node.id,
      event: node.event,
      E: null,
      L: null,
      active: false,
      dimmed: false,
      settled: false,
    },
    position: { x: node.x, y: node.y },
    classes: [node.is_source ? 'is-source' : '', node.is_sink ? 'is-sink' : '']
      .filter(Boolean)
      .join(' '),
  }))

  const edges = result.edges.map((edge) => ({
    group: 'edges',
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      activityId: edge.activity_id ?? '',
      labelOffsetX: 0,
      labelOffsetY: 0,
      controlPointDistance: 0,
    },
    classes: edge.is_dummy ? 'is-dummy' : '',
  }))

  return [...nodes, ...edges]
}

export function applyStepToGraph(cy, step, { result, mode = 'overview' } = {}) {
  if (!cy || cy.destroyed()) {
    return
  }

  const visibility = getStepVisibility(result, step, mode)
  const activeNodeIds = new Set(visibility.activeNodeIds)
  const activeEdgeIds = new Set(visibility.activeEdgeIds)
  const dimmedNodeIds = new Set(visibility.dimmedNodeIds)
  const dimmedEdgeIds = new Set(visibility.dimmedEdgeIds)

  cy.batch(() => {
    cy.elements().removeClass(
      'is-highlight is-current is-critical is-active is-dimmed',
    )

    cy.nodes().forEach((node) => {
      const nodeId = node.id()
      node.data('E', step?.snapshot?.E?.[nodeId] ?? null)
      node.data('L', step?.snapshot?.L?.[nodeId] ?? null)
      node.data('active', activeNodeIds.has(nodeId))
      node.data('dimmed', dimmedNodeIds.has(nodeId))
    })

    if (!step) {
      return
    }

    for (const nodeId of step.snapshot?.critical_nodes ?? []) {
      cy.getElementById(nodeId).addClass('is-critical')
    }

    for (const edgeId of step.snapshot?.critical_edges ?? []) {
      cy.getElementById(edgeId).addClass('is-critical')
    }

    for (const nodeId of step.highlight_nodes ?? []) {
      cy.getElementById(nodeId).addClass('is-highlight')
    }

    for (const edgeId of step.highlight_edges ?? []) {
      cy.getElementById(edgeId).addClass('is-highlight')
    }

    if (step.node_id) {
      cy.getElementById(step.node_id).addClass('is-current')
    }

    for (const nodeId of activeNodeIds) {
      cy.getElementById(nodeId).addClass('is-active')
    }

    for (const edgeId of activeEdgeIds) {
      cy.getElementById(edgeId).addClass('is-active')
    }

    for (const nodeId of dimmedNodeIds) {
      cy.getElementById(nodeId).addClass('is-dimmed')
    }

    for (const edgeId of dimmedEdgeIds) {
      cy.getElementById(edgeId).addClass('is-dimmed')
    }
  })
}
