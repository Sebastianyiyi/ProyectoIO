const TOLERANCE = 1e-9

function findNode(result, nodeId) {
  return (result?.nodes ?? []).find((node) => node.id === nodeId) ?? null
}

function edgeName(edge) {
  return edge?.activity_id ?? edge?.dummy_label ?? edge?.label ?? edge?.id ?? '—'
}

function sortTerms(terms) {
  return terms.sort((a, b) => {
    const eventA = a.sourceEvent ?? a.targetEvent ?? 0
    const eventB = b.sourceEvent ?? b.targetEvent ?? 0
    return eventA - eventB || String(a.label).localeCompare(String(b.label))
  })
}

function forwardCalculation(result, step, index) {
  const node = findNode(result, step.node_id)
  if (!node) {
    return null
  }

  const incoming = (result.edges ?? [])
    .filter((edge) => edge.target === step.node_id)
    .map((edge) => {
      const sourceNode = findNode(result, edge.source)
      const baseValue = step.snapshot?.E?.[edge.source]
      const duration = Number(edge.duration)
      const resultValue =
        baseValue === null || baseValue === undefined
          ? null
          : Number(baseValue) + duration

      return {
        edgeId: edge.id,
        label: edgeName(edge),
        activityId: edge.activity_id,
        isDummy: Boolean(edge.is_dummy),
        sourceEvent: sourceNode?.event ?? null,
        targetEvent: node.event,
        baseLabel: 'E',
        baseValue:
          baseValue === null || baseValue === undefined
            ? null
            : Number(baseValue),
        duration,
        result: resultValue,
        isBest: false,
      }
    })

  if (incoming.length === 0) {
    const value = step.labels?.E ?? step.snapshot?.E?.[node.id] ?? 0
    return {
      phase: 'forward',
      kind: 'definition',
      stepNumber: index + 1,
      node,
      formula: 'E_j = 0',
      operator: 'max',
      value,
      terms: [],
    }
  }

  const validResults = incoming
    .map((term) => term.result)
    .filter((value) => Number.isFinite(value))
  const best = validResults.length > 0 ? Math.max(...validResults) : null

  for (const term of incoming) {
    term.isBest =
      best !== null &&
      term.result !== null &&
      Math.abs(term.result - best) <= TOLERANCE
  }

  return {
    phase: 'forward',
    kind: 'terms',
    stepNumber: index + 1,
    node,
    formula: 'E_j = max_i (E_i + t_ij)',
    operator: 'max',
    value: step.labels?.E ?? best,
    terms: sortTerms(incoming),
  }
}

function backwardCalculation(result, step, index) {
  const node = findNode(result, step.node_id)
  if (!node) {
    return null
  }

  const outgoing = (result.edges ?? [])
    .filter((edge) => edge.source === step.node_id)
    .map((edge) => {
      const targetNode = findNode(result, edge.target)
      const baseValue = step.snapshot?.L?.[edge.target]
      const duration = Number(edge.duration)
      const resultValue =
        baseValue === null || baseValue === undefined
          ? null
          : Number(baseValue) - duration

      return {
        edgeId: edge.id,
        label: edgeName(edge),
        activityId: edge.activity_id,
        isDummy: Boolean(edge.is_dummy),
        sourceEvent: node.event,
        targetEvent: targetNode?.event ?? null,
        baseLabel: 'L',
        baseValue:
          baseValue === null || baseValue === undefined
            ? null
            : Number(baseValue),
        duration,
        result: resultValue,
        isBest: false,
      }
    })

  if (outgoing.length === 0) {
    const value = step.labels?.L ?? step.snapshot?.L?.[node.id] ?? node.L
    return {
      phase: 'backward',
      kind: 'definition',
      stepNumber: index + 1,
      node,
      formula: 'L_i = E_i',
      operator: 'min',
      value,
      terms: [],
    }
  }

  const validResults = outgoing
    .map((term) => term.result)
    .filter((value) => Number.isFinite(value))
  const best = validResults.length > 0 ? Math.min(...validResults) : null

  for (const term of outgoing) {
    term.isBest =
      best !== null &&
      term.result !== null &&
      Math.abs(term.result - best) <= TOLERANCE
  }

  return {
    phase: 'backward',
    kind: 'terms',
    stepNumber: index + 1,
    node,
    formula: 'L_i = min_j (L_j - t_ij)',
    operator: 'min',
    value: step.labels?.L ?? best,
    terms: sortTerms(outgoing),
  }
}

function criticalCalculation(result, step, index) {
  if (!step.node_id) {
    return {
      phase: 'critical',
      kind: 'summary',
      stepNumber: index + 1,
      node: null,
      formula: 'Ruta crítica',
      value: result.project_duration,
      criticalPath: result.critical_path ?? [],
      projectDuration: result.project_duration,
      terms: [],
    }
  }

  const edge = (result.edges ?? []).find(
    (item) => step.highlight_edges?.includes(item.id) && !item.is_dummy,
  )
  const activity = edge
    ? (result.activities ?? []).find((item) => item.id === edge.activity_id)
    : null

  if (!edge) {
    return {
      phase: 'critical',
      kind: 'summary',
      stepNumber: index + 1,
      node: findNode(result, step.node_id),
      formula: 'Ruta crítica',
      value: result.project_duration,
      criticalPath: result.critical_path ?? [],
      projectDuration: result.project_duration,
      terms: [],
    }
  }

  const startNode = findNode(result, edge.source)
  const endNode = findNode(result, edge.target)
  const duration = Number(activity?.expected_time ?? edge.duration)
  const slack = Number(
    activity?.slack ?? endNode?.L - startNode?.E - duration,
  )

  const activityId = activity?.id ?? edge.activity_id ?? edge.id

  return {
    phase: 'critical',
    kind: 'critical',
    stepNumber: index + 1,
    node: endNode,
    formula: `H(${activityId}) = L_j - E_i - t_ij`,
    value: slack,
    terms: [],
    activity: {
      id: activityId,
      name: activity?.name ?? edge.name ?? '',
      duration,
      slack,
      startEvent: activity?.start_event ?? startNode?.event ?? null,
      endEvent: activity?.end_event ?? endNode?.event ?? null,
      startE: startNode?.E ?? null,
      endL: endNode?.L ?? null,
    },
  }
}

export function buildStepCalculation(result, step, index = 0) {
  if (!result || !step) {
    return null
  }

  if (step.type === 'forward') {
    return forwardCalculation(result, step, index)
  }

  if (step.type === 'backward') {
    return backwardCalculation(result, step, index)
  }

  if (step.type === 'critical') {
    return criticalCalculation(result, step, index)
  }

  return null
}
