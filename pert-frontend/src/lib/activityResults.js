function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function getActivityRows(result) {
  const nodes = result?.nodes ?? []
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const nodesByEvent = new Map(nodes.map((node) => [node.event, node]))

  return (result?.activities ?? []).map((activity) => {
    const startNode =
      nodesById.get(activity.start_node_id) ??
      nodesByEvent.get(activity.start_event)
    const endNode =
      nodesById.get(activity.end_node_id) ??
      nodesByEvent.get(activity.end_event)

    return {
      ...activity,
      startE: toNumber(startNode?.E),
      endL: toNumber(endNode?.L),
    }
  })
}

export function getCriticalVariance(result) {
  const fromProbability = toNumber(result?.probability?.critical_variance)
  if (fromProbability !== null) {
    return fromProbability
  }

  const activities = result?.activities ?? []
  const activitiesById = new Map(
    activities.map((activity) => [activity.id, activity]),
  )
  const criticalIds =
    result?.critical_path?.length > 0
      ? result.critical_path
      : result?.critical_activities ?? []

  return criticalIds.reduce((total, activityId) => {
    const variance = toNumber(activitiesById.get(activityId)?.variance)
    return total + (variance ?? 0)
  }, 0)
}

export function getUnifiedActivityRows(result) {
  if (!result) return []

  const nodes = result?.nodes ?? []
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const nodesByEvent = new Map(nodes.map((node) => [node.event, node]))

  const realRows = (result?.activities ?? []).map((activity) => {
    const startNode =
      nodesById.get(activity.start_node_id) ??
      nodesByEvent.get(activity.start_event)
    const endNode =
      nodesById.get(activity.end_node_id) ??
      nodesByEvent.get(activity.end_event)

    return {
      id: activity.id,
      name: activity.name || '',
      startEvent: activity.start_event ?? startNode?.event ?? '—',
      endEvent: activity.end_event ?? endNode?.event ?? '—',
      expectedTime: toNumber(activity.expected_time),
      startE: toNumber(startNode?.E),
      endL: toNumber(endNode?.L),
      variance: toNumber(activity.variance),
      slack: toNumber(activity.slack),
      isCritical: Boolean(activity.is_critical),
      isDummy: false,
    }
  })

  const dummyEdges = (result?.edges ?? []).filter((edge) => Boolean(edge.is_dummy))
  const dummyRows = dummyEdges.map((edge) => {
    const startNode = nodesById.get(edge.source)
    const endNode = nodesById.get(edge.target)

    return {
      id: edge.dummy_label || edge.id,
      name: 'Actividad Ficticia',
      startEvent: startNode?.event ?? '—',
      endEvent: endNode?.event ?? '—',
      expectedTime: toNumber(edge.duration) ?? 0,
      startE: toNumber(startNode?.E),
      endL: toNumber(endNode?.L),
      variance: 0,
      slack: toNumber(edge.slack),
      isCritical: Boolean(edge.is_critical),
      isDummy: true,
    }
  })

  return [...realRows, ...dummyRows]
}
