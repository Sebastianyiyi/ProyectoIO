import { describe, expect, it } from 'vitest'
import { computeEdgeLabelLayout } from './edgeLabelLayout'

const nodes = [
  { id: 'n1', x: 0, y: 0 },
  { id: 'n2', x: 100, y: 0 },
  { id: 'n3', x: 0, y: 100 },
  { id: 'n4', x: 100, y: 100 },
]

describe('computeEdgeLabelLayout', () => {
  it('places horizontal, descending and ascending labels on the correct side', () => {
    const layout = computeEdgeLabelLayout(nodes, [
      { id: 'horizontal', source: 'n1', target: 'n2', label: 'A (2.00)' },
      { id: 'descending', source: 'n1', target: 'n4', label: 'B (3.00)' },
      { id: 'ascending', source: 'n3', target: 'n2', label: 'C (4.00)' },
    ])

    expect(layout.horizontal.offsetY).toBe(-14)
    expect(layout.descending.offsetY).toBe(-16)
    expect(layout.ascending.offsetY).toBe(16)
    expect(layout.horizontal.controlPointDistance).toBe(0)
  })

  it('separates labels and curves one edge when segments cross', () => {
    const layout = computeEdgeLabelLayout(nodes, [
      { id: 'descending', source: 'n1', target: 'n4', label: 'E (3.00)' },
      { id: 'ascending', source: 'n3', target: 'n2', label: 'f1 (0.00)' },
    ])

    expect(Math.sign(layout.descending.offsetY)).toBe(
      -Math.sign(layout.ascending.offsetY),
    )
    expect(
      Math.abs(layout.descending.controlPointDistance) +
        Math.abs(layout.ascending.controlPointDistance),
    ).toBeGreaterThan(0)
  })

  it('returns one entry per edge and ignores edges without endpoints', () => {
    const layout = computeEdgeLabelLayout(nodes, [
      { id: 'valid', source: 'n1', target: 'n2', label: 'A (2.00)' },
      { id: 'invalid', source: 'missing', target: 'n2', label: 'X' },
    ])

    expect(Object.keys(layout)).toEqual(['valid'])
  })
})
