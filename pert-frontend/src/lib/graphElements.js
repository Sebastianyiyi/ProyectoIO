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
    },
    classes: edge.is_dummy ? 'is-dummy' : '',
  }))

  return [...nodes, ...edges]
}

export function applyStepToGraph(cy, step) {
  if (!cy || cy.destroyed()) {
    return
  }

  cy.batch(() => {
    cy.elements().removeClass('is-highlight is-current is-critical')

    cy.nodes().forEach((node) => {
      const nodeId = node.id()
      node.data('E', step?.snapshot?.E?.[nodeId] ?? null)
      node.data('L', step?.snapshot?.L?.[nodeId] ?? null)
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
  })
}
