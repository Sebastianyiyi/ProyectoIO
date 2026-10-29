export function getApiErrorMessage(payload, status) {
  if (payload && typeof payload.detail === 'string') {
    return payload.detail
  }

  if (payload && Array.isArray(payload.detail)) {
    const messages = payload.detail
      .map((item) => item?.msg)
      .filter((message) => typeof message === 'string' && message.length > 0)

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  if (payload && typeof payload.message === 'string') {
    return payload.message
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  return `La API respondió con un error (${status}).`
}
