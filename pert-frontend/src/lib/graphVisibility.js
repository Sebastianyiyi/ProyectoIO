function activeIdsForStep(step) {
  const nodeIds = new Set(step?.highlight_nodes ?? [])
  const edgeIds = new Set(step?.highlight_edges ?? [])

  if (step?.node_id) {
    nodeIds.add(step.node_id)
  }

  return { nodeIds, edgeIds }
}

function processedNodeIds(result, step) {
  if (!step) {
    return new Set()
  }

  if (step.type === 'critical') {
    return new Set((result?.nodes ?? []).map((node) => node.id))
  }

  const snapshot = step.type === 'forward' ? step.snapshot?.E : step.snapshot?.L
  return new Set(Object.keys(snapshot ?? {}))
}

export function getStepVisibility(result, step, mode = 'overview') {
  const active = activeIdsForStep(step)
  const nodes = result?.nodes ?? []
  const edges = result?.edges ?? []

  if (!step || !result || mode !== 'focus') {
    return {
      activeNodeIds: [...active.nodeIds],
      activeEdgeIds: [...active.edgeIds],
      dimmedNodeIds: [],
      dimmedEdgeIds: [],
      focusNodeIds: [...active.nodeIds],
      focusEdgeIds: [...active.edgeIds],
    }
  }

  const processedNodes = processedNodeIds(result, step)
  const processedEdges = new Set(
    edges
      .filter((edge) => {
        if (step.type === 'forward') {
          return processedNodes.has(edge.target)
        }
        if (step.type === 'backward') {
          return processedNodes.has(edge.source)
        }
        return true
      })
      .map((edge) => edge.id),
  )

  const dimmedNodeIds = nodes
    .map((node) => node.id)
    .filter((id) => !processedNodes.has(id) && !active.nodeIds.has(id))
  const dimmedEdgeIds = edges
    .map((edge) => edge.id)
    .filter((id) => !processedEdges.has(id) && !active.edgeIds.has(id))

  return {
    activeNodeIds: [...active.nodeIds],
    activeEdgeIds: [...active.edgeIds],
    dimmedNodeIds,
    dimmedEdgeIds,
    focusNodeIds: [...active.nodeIds],
    focusEdgeIds: [...active.edgeIds],
  }
}
