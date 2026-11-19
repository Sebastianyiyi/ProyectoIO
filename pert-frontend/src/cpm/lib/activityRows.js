export function getActivityRows(result) {
  const nodes = new Map((result?.nodes ?? []).map((node) => [node.id, node]))
  return (result?.activities ?? []).map((activity) => ({
    ...activity,
    expected_time: activity.duration,
    startE: nodes.get(activity.start_node_id)?.E,
    endL: nodes.get(activity.end_node_id)?.L,
  }))
}

export function getUnifiedActivityRows(result) {
  const nodes = new Map((result?.nodes ?? []).map((node) => [node.id, node]))
  const real = getActivityRows(result).map((activity) => ({
    id: activity.id,
    name: activity.name,
    startEvent: activity.start_event,
    endEvent: activity.end_event,
    expectedTime: activity.duration,
    startE: activity.startE,
    endL: activity.endL,
    slack: activity.slack,
    isCritical: activity.is_critical,
    isDummy: false,
  }))
  const dummy = (result?.edges ?? []).filter((edge) => edge.is_dummy).map((edge) => ({
    id: edge.dummy_label,
    name: 'Actividad ficticia',
    startEvent: nodes.get(edge.source)?.event,
    endEvent: nodes.get(edge.target)?.event,
    expectedTime: 0,
    startE: nodes.get(edge.source)?.E,
    endL: nodes.get(edge.target)?.L,
    slack: edge.slack,
    isCritical: edge.is_critical,
    isDummy: true,
  }))
  return [...real, ...dummy]
}
