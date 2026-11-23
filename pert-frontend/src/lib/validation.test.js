import { describe, expect, it } from 'vitest'
import { validateProject } from './validation'

function activity(key, id, predecessors = [], a = 1, m = 2, b = 3) {
  return {
    key,
    id,
    name: '',
    predecessors,
    a: String(a),
    m: String(m),
    b: String(b),
  }
}

describe('validateProject', () => {
  it('accepts a valid project', () => {
    const result = validateProject(
      [
        activity('k1', 'A', [], 1, 2, 3),
        activity('k2', 'B', ['A'], 2, 3, 4),
      ],
      '8',
    )

    expect(result.valid).toBe(true)
    expect(result.general).toEqual([])
    expect(result.byKey).toEqual({})
  })

  it('detects duplicate identifiers', () => {
    const result = validateProject(
      [activity('k1', 'A'), activity('k2', 'A')],
      '',
    )

    expect(result.valid).toBe(false)
    expect(result.byKey.k1.id).toMatch(/repetido/)
    expect(result.byKey.k2.id).toMatch(/repetido/)
  })

  it('detects self references and missing predecessors', () => {
    const result = validateProject(
      [activity('k1', 'A', ['A']), activity('k2', 'B', ['Z'])],
      '',
    )

    expect(result.byKey.k1.predecessors).toMatch(/propio predecesor/)
    expect(result.byKey.k2.predecessors).toMatch(/no existe/)
  })

  it('validates numeric estimates and their order', () => {
    const result = validateProject(
      [
        activity('k1', 'A', [], 5, 3, 4),
        activity('k2', 'B', [], 1, 2, ''),
      ],
      '',
    )

    expect(result.byKey.k1.time).toMatch(/a ≤ m ≤ b/)
    expect(result.byKey.k2.b).toMatch(/número válido/)
  })

  it('detects dependency cycles', () => {
    const result = validateProject(
      [
        activity('k1', 'A', ['C']),
        activity('k2', 'B', ['A']),
        activity('k3', 'C', ['B']),
      ],
      '',
    )

    expect(result.valid).toBe(false)
    expect(result.general.join(' ')).toMatch(/ciclo/)
  })

  it('rejects an invalid target time', () => {
    const result = validateProject([activity('k1', 'A')], '-1')

    expect(result.valid).toBe(false)
    expect(result.general.join(' ')).toMatch(/tiempo objetivo/)
  })
})
