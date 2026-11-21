import { useCallback, useRef, useState } from 'react'
import { getCpmExample, solveCpm } from '../api/cpmApi'
import { activitiesFromExample, createActivity, toPayload, updateActivity as patchActivity, validateProject } from '../lib/project'

const emptyErrors = () => ({ general: [], byKey: {} })

export function useCpmSolver() {
  const [activities, setActivities] = useState(() => [createActivity()])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState(emptyErrors)
  const version = useRef(0)

  const invalidate = useCallback(() => {
    version.current += 1
    setResult(null)
    setError(null)
    setFieldErrors(emptyErrors())
    setLoading(false)
  }, [])

  const solve = useCallback(async () => {
    const validation = validateProject(activities)
    setFieldErrors(validation)
    if (!validation.valid) {
      setResult(null)
      return null
    }
    const current = ++version.current
    setLoading(true)
    setError(null)
    try {
      const data = await solveCpm(toPayload(activities))
      if (version.current !== current) return null
      setResult(data)
      return data
    } catch (failure) {
      if (version.current === current) { setError(failure.message); setResult(null) }
      return null
    } finally {
      if (version.current === current) setLoading(false)
    }
  }, [activities])

  const loadExample = useCallback(async () => {
    const current = ++version.current
    setLoading(true)
    setError(null)
    setFieldErrors(emptyErrors())
    try {
      const example = await getCpmExample()
      if (version.current !== current) return null
      const next = activitiesFromExample(example)
      setActivities(next)
      setResult(null)
      const data = await solveCpm(toPayload(next))
      if (version.current !== current) return null
      setResult(data)
      return data
    } catch (failure) {
      if (version.current === current) { setError(failure.message); setResult(null) }
      return null
    } finally {
      if (version.current === current) setLoading(false)
    }
  }, [])

  const updateActivity = useCallback((key, patch) => {
    invalidate()
    setActivities((current) => patchActivity(current, key, patch))
  }, [invalidate])

  const addActivity = useCallback(() => {
    invalidate()
    setActivities((current) => [...current, createActivity()])
  }, [invalidate])

  const removeActivity = useCallback((key) => {
    invalidate()
    setActivities((current) => {
      if (current.length <= 1) return current
      const removed = current.find((activity) => activity.key === key)?.id.trim()
      return current.filter((activity) => activity.key !== key).map((activity) => ({
        ...activity, predecessors: activity.predecessors.filter((id) => id !== removed),
      }))
    })
  }, [invalidate])

  const clear = useCallback(() => {
    invalidate()
    setActivities([createActivity()])
  }, [invalidate])

  return { activities, result, loading, error, fieldErrors, solve, loadExample, updateActivity, addActivity, removeActivity, clear }
}
