import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './apiError'

describe('getApiErrorMessage', () => {
  it('reads a string detail from FastAPI', () => {
    expect(getApiErrorMessage({ detail: 'Proyecto inválido' }, 422)).toBe(
      'Proyecto inválido',
    )
  })

  it('joins validation messages from FastAPI', () => {
    expect(
      getApiErrorMessage(
        {
          detail: [
            { msg: 'La actividad A debe cumplir a <= m <= b.' },
            { msg: 'El predecesor Z no existe.' },
          ],
        },
        422,
      ),
    ).toBe(
      'La actividad A debe cumplir a <= m <= b. El predecesor Z no existe.',
    )
  })

  it('falls back to a generic message', () => {
    expect(getApiErrorMessage(null, 500)).toBe(
      'La API respondió con un error (500).',
    )
  })
})
