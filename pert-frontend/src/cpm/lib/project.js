let sequence = 0

export function createActivity(data = {}) {
  sequence += 1
  return {
    key: `cpm-${sequence}`,
    id: '', name: '', predecessors: [], duration: '',
    ...data,
  }
}

export function activitiesFromExample(example) {
  return example.activities.map((activity) => createActivity({
    id: activity.id,
    name: activity.name ?? '',
    predecessors: [...(activity.predecessors ?? [])],
    duration: String(activity.duration),
  }))
}

export function parseDuration(value) {
  const text = String(value ?? '').trim()
  return text ? Number(text.replace(',', '.')) : Number.NaN
}

export function toPayload(activities) {
  return {
    activities: activities.map((activity) => ({
      id: activity.id.trim(),
      ...(activity.name.trim() ? { name: activity.name.trim() } : {}),
      predecessors: activity.predecessors.map((id) => id.trim()).filter(Boolean),
      duration: parseDuration(activity.duration),
    })),
  }
}

export function updateActivity(activities, key, patch) {
  const previous = activities.find((activity) => activity.key === key)
  const previousId = previous?.id?.trim()
  const nextId = patch.id === undefined ? previousId : patch.id.trim()
  return activities.map((activity) => ({
    ...activity,
    ...(activity.key === key ? patch : {}),
    predecessors: (activity.key === key && patch.predecessors ? patch.predecessors : activity.predecessors)
      .map((id) => previousId && nextId && id === previousId ? nextId : id),
  }))
}

export function validateProject(activities) {
  const byKey = {}
  const general = []
  const ids = new Map()
  const fail = (key, field, message) => {
    byKey[key] = { ...byKey[key], [field]: message }
  }
  if (!activities.length) general.push('Agrega al menos una actividad al proyecto CPM.')
  for (const activity of activities) {
    const id = activity.id.trim()
    if (!id) fail(activity.key, 'id', 'El identificador es obligatorio.')
    else if (ids.has(id)) {
      fail(activity.key, 'id', `El identificador ${id} está repetido.`)
      fail(ids.get(id).key, 'id', `El identificador ${id} está repetido.`)
    } else ids.set(id, activity)
    const duration = parseDuration(activity.duration)
    if (!Number.isFinite(duration) || duration < 0) fail(activity.key, 'duration', 'La duración debe ser un número mayor o igual a 0.')
  }
  const degree = new Map([...ids.keys()].map((id) => [id, 0]))
  const successors = new Map([...ids.keys()].map((id) => [id, []]))
  for (const activity of activities) {
    const id = activity.id.trim()
    for (const predecessor of new Set(activity.predecessors.map((value) => value.trim()).filter(Boolean))) {
      if (predecessor === id) fail(activity.key, 'predecessors', 'Una actividad no puede depender de sí misma.')
      else if (!ids.has(predecessor)) fail(activity.key, 'predecessors', `El predecesor ${predecessor} no existe.`)
      else if (degree.has(id)) {
        degree.set(id, degree.get(id) + 1)
        successors.get(predecessor).push(id)
      }
    }
  }
  const queue = [...degree.keys()].filter((id) => degree.get(id) === 0)
  let visited = 0
  for (let index = 0; index < queue.length; index += 1) {
    visited += 1
    for (const next of successors.get(queue[index])) {
      degree.set(next, degree.get(next) - 1)
      if (degree.get(next) === 0) queue.push(next)
    }
  }
  if (visited !== ids.size) general.push('Hay un ciclo de dependencias en las actividades CPM.')
  return { valid: !general.length && !Object.keys(byKey).length, general, byKey }
}
