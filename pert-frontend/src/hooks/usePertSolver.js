import { useCallback, useRef, useState } from 'react'
import { getExample, solvePert } from '../api/pertApi'
import {
  activitiesFromExample,
  applyActivityPatch,
  createActivity,
  removeActivityFromList,
  toPertPayload,
} from '../lib/activities'
import { validateProject } from '../lib/validation'

function emptyFieldErrors() {
  return { general: [], byKey: {} }
}

export function usePertSolver() {
  const [activities, setActivities] = useState(() => [createActivity()])
  const [targetTime, setTargetTime] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exampleLoading, setExampleLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors)
  const requestRef = useRef(0)

  const runSolve = useCallback(async (nextActivities, nextTargetTime) => {
    const validation = validateProject(nextActivities, nextTargetTime)
    setFieldErrors({ general: validation.general, byKey: validation.byKey })

    if (!validation.valid) {
      setError('Revisa los datos marcados antes de resolver el proyecto.')
      return null
    }

    requestRef.current += 1
    const requestId = requestRef.current

    setLoading(true)
    setError(null)

    try {
      const data = await solvePert(toPertPayload(nextActivities, nextTargetTime))

      if (requestRef.current !== requestId) {
        return null
      }

      setResult(data)
      return data
    } catch (requestError) {
      if (requestRef.current !== requestId) {
        return null
      }

      setResult(null)
      setError(requestError.message)
      return null
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [])

  const solve = useCallback(
    () => runSolve(activities, targetTime),
    [activities, runSolve, targetTime],
  )

  const loadExample = useCallback(async () => {
    setExampleLoading(true)
    setError(null)
    setFieldErrors(emptyFieldErrors())

    try {
      const example = await getExample()
      const nextActivities = activitiesFromExample(example)
      const nextTarget =
        example?.target_time === null || example?.target_time === undefined
          ? ''
          : String(example.target_time)

      setActivities(nextActivities)
      setTargetTime(nextTarget)
      await runSolve(nextActivities, nextTarget)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setExampleLoading(false)
    }
  }, [runSolve])

  const clearProject = useCallback(() => {
    requestRef.current += 1
    setActivities([createActivity()])
    setTargetTime('')
    setResult(null)
    setError(null)
    setFieldErrors(emptyFieldErrors())
    setLoading(false)
  }, [])

  const updateActivity = useCallback((key, patch) => {
    setActivities((current) => applyActivityPatch(current, key, patch))
  }, [])

  const addActivity = useCallback(() => {
    setActivities((current) => [...current, createActivity()])
  }, [])

  const removeActivity = useCallback((key) => {
    setActivities((current) => removeActivityFromList(current, key))
  }, [])

  return {
    activities,
    targetTime,
    result,
    loading,
    exampleLoading,
    error,
    fieldErrors,
    setTargetTime,
    solve,
    loadExample,
    clearProject,
    updateActivity,
    addActivity,
    removeActivity,
  }
}
