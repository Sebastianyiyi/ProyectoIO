const BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

async function request(path, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    const payload = await response.json()
    if (!response.ok) {
      if (response.status === 404) throw new Error('La API CPM no está disponible. Reinicia el backend con los archivos actualizados.')
      const detail = payload?.detail
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg).join(' ')
        : typeof detail === 'string' ? detail : 'No fue posible resolver el proyecto CPM.'
      throw new Error(message)
    }
    return payload
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La API CPM tardó demasiado en responder.')
    if (error instanceof TypeError) throw new Error(`No se pudo conectar con la API en ${BASE_URL}. Comprueba el backend.`)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export const getCpmExample = () => request('/api/v1/cpm/example')
export const solveCpm = (payload) => request('/api/v1/cpm/solve', payload)
