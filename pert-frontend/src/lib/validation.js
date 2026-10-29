const NUMERIC_FIELDS = ['a', 'm', 'b']

function asNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return Number.NaN
  }

  return Number(value)
}

function findCycle(activities) {
  const graph = new Map()

  for (const activity of activities) {
    const id = String(activity.id ?? '').trim()
    if (id) {
      graph.set(id, [])
    }
  }

  for (const activity of activities) {
    const id = String(activity.id ?? '').trim()
    if (!graph.has(id)) {
      continue
    }

    for (const predecessor of activity.predecessors ?? []) {
      const predecessorId = String(predecessor).trim()
      if (graph.has(predecessorId)) {
        graph.get(predecessorId).push(id)
      }
    }
  }

  const visiting = new Set()
  const visited = new Set()
  const stack = []

  function visit(node) {
    if (visiting.has(node)) {
      const start = stack.indexOf(node)
      return [...stack.slice(start), node]
    }

    if (visited.has(node)) {
      return null
    }

    visiting.add(node)
    stack.push(node)

    for (const next of graph.get(node) ?? []) {
      const cycle = visit(next)
      if (cycle) {
        return cycle
      }
    }

    stack.pop()
    visiting.delete(node)
    visited.add(node)
    return null
  }

  for (const node of graph.keys()) {
    const cycle = visit(node)
    if (cycle) {
      return cycle
    }
  }

  return null
}

export function validateProject(activities, targetTime) {
  const general = []
  const byKey = {}

  const addFieldError = (key, field, message) => {
    byKey[key] = byKey[key] ?? {}
    byKey[key][field] = byKey[key][field] ?? message
  }

  if (!Array.isArray(activities) || activities.length === 0) {
    general.push('Agrega al menos una actividad al proyecto.')
  }

  const ids = new Map()

  for (const activity of activities ?? []) {
    const id = String(activity.id ?? '').trim()

    if (!id) {
      addFieldError(activity.key, 'id', 'El identificador es obligatorio.')
    } else if (ids.has(id)) {
      addFieldError(
        activity.key,
        'id',
        `El identificador "${id}" está repetido.`,
      )
      addFieldError(
        ids.get(id).key,
        'id',
        `El identificador "${id}" está repetido.`,
      )
    } else {
      ids.set(id, activity)
    }

    for (const field of NUMERIC_FIELDS) {
      const value = asNumber(activity[field])

      if (!Number.isFinite(value)) {
        addFieldError(activity.key, field, 'Ingresa un número válido.')
      } else if (value < 0) {
        addFieldError(activity.key, field, 'Debe ser mayor o igual a 0.')
      }
    }

    const a = asNumber(activity.a)
    const m = asNumber(activity.m)
    const b = asNumber(activity.b)

    if (
      Number.isFinite(a) &&
      Number.isFinite(m) &&
      Number.isFinite(b) &&
      (a > m || m > b)
    ) {
      addFieldError(
        activity.key,
        'time',
        'Debe cumplirse a ≤ m ≤ b.',
      )
    }
  }

  const knownIds = new Set(ids.keys())

  for (const activity of activities ?? []) {
    const id = String(activity.id ?? '').trim()

    for (const predecessor of activity.predecessors ?? []) {
      const predecessorId = String(predecessor).trim()

      if (!predecessorId) {
        continue
      }

      if (predecessorId === id) {
        addFieldError(
          activity.key,
          'predecessors',
          'Una actividad no puede ser su propio predecesor.',
        )
      } else if (!knownIds.has(predecessorId)) {
        addFieldError(
          activity.key,
          'predecessors',
          `El predecesor "${predecessorId}" no existe.`,
        )
      }
    }
  }

  const cycle = findCycle(activities ?? [])
  if (cycle) {
    general.push(`Hay un ciclo de dependencias: ${cycle.join(' → ')}.`)
  }

  const target = String(targetTime ?? '').trim()
  if (target) {
    const number = Number(target)
    if (!Number.isFinite(number) || number < 0) {
      general.push('El tiempo objetivo T debe ser un número mayor o igual a 0.')
    }
  }

  return {
    valid: general.length === 0 && Object.keys(byKey).length === 0,
    general,
    byKey,
  }
}
