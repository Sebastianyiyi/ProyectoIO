import { getApiErrorMessage } from '../lib/apiError'

const configuredUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const API_BASE_URL = configuredUrl.replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 20000

async function request(path, { method = 'GET', body, signal } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const text = await response.text()
    let payload = null

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = text
      }
    }

    if (!response.ok) {
      throw new Error(getApiErrorMessage(payload, response.status))
    }

    return payload
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'La solicitud tardó demasiado. Verifica que el backend esté activo.',
      )
    }

    if (error instanceof TypeError) {
      throw new Error(
        `No se pudo conectar con la API en ${API_BASE_URL}. Verifica que el backend esté corriendo.`,
      )
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function getHealth() {
  return request('/health')
}

export function getExample() {
  return request('/api/v1/pert/example')
}

export function solvePert(payload) {
  return request('/api/v1/pert/solve', {
    method: 'POST',
    body: payload,
  })
}
