import { useCallback, useEffect, useState } from 'react'
import { getHealth } from '../api/pertApi'

export function useBackendHealth() {
  const [status, setStatus] = useState('checking')

  const check = useCallback(() => {
    setStatus('checking')
    return getHealth()
      .then(() => {
        setStatus('online')
        return true
      })
      .catch(() => {
        setStatus('offline')
        return false
      })
  }, [])

  useEffect(() => {
    let active = true

    getHealth()
      .then(() => {
        if (active) {
          setStatus('online')
        }
      })
      .catch(() => {
        if (active) {
          setStatus('offline')
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { status, check }
}
