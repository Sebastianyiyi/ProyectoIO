let sequence = 0

function createKey() {
  sequence += 1
  const random =
    globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${sequence}`

  return `activity-${random}`
}

export function createActivity(overrides = {}) {
  return {
    key: createKey(),
    id: '',
    name: '',
    predecessors: [],
    a: '',
    m: '',
    b: '',
    ...overrides,
  }
}

export function activitiesFromExample(example) {
  return (example?.activities ?? []).map((activity) =>
    createActivity({
      id: String(activity.id ?? ''),
      name: String(activity.name ?? ''),
      predecessors: Array.isArray(activity.predecessors)
        ? activity.predecessors.map(String)
        : [],
      a: String(activity.a ?? ''),
      m: String(activity.m ?? ''),
      b: String(activity.b ?? ''),
    }),
  )
}

export function toPertPayload(activities, targetTime) {
  const cleanedTarget =
    targetTime === null || targetTime === undefined || String(targetTime).trim() === ''
      ? null
      : Number(targetTime)

  return {
    activities: activities.map((activity) => {
      const name = String(activity.name ?? '').trim()

      return {
        id: String(activity.id ?? '').trim(),
        ...(name ? { name } : {}),
        predecessors: (activity.predecessors ?? [])
          .map((predecessor) => String(predecessor).trim())
          .filter(Boolean),
        a: Number(activity.a),
        m: Number(activity.m),
        b: Number(activity.b),
      }
    }),
    target_time: cleanedTarget,
  }
}

export function applyActivityPatch(activities, key, patch) {
  const current = activities.find((activity) => activity.key === key)
  if (!current) {
    return activities
  }

  const previousId = String(current.id ?? '').trim()
  const nextId =
    patch.id === undefined ? previousId : String(patch.id ?? '').trim()

  return activities.map((activity) => {
    const isTarget = activity.key === key
    const nextActivity = isTarget ? { ...activity, ...patch } : { ...activity }

    if (previousId && nextId && previousId !== nextId) {
      nextActivity.predecessors = (nextActivity.predecessors ?? []).map(
        (predecessor) =>
          String(predecessor).trim() === previousId ? nextId : predecessor,
      )
    }

    return nextActivity
  })
}

export function removeActivityFromList(activities, key) {
  const removed = activities.find((activity) => activity.key === key)
  if (!removed) {
    return activities
  }

  const removedId = String(removed.id ?? '').trim()

  return activities
    .filter((activity) => activity.key !== key)
    .map((activity) => ({
      ...activity,
      predecessors: (activity.predecessors ?? []).filter(
        (predecessor) => String(predecessor).trim() !== removedId,
      ),
    }))
}
