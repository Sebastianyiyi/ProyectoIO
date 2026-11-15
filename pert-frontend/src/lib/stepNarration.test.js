import { describe, expect, it } from 'vitest'
import { buildStepNarration, toSubscript } from './stepNarration'

const result = {
  nodes: [
    { id: 'n1', event: 1, E: 0, L: 0 },
    { id: 'n2', event: 2, E: 3, L: 3 },
    { id: 'n3', event: 3, E: 5, L: 5 },
  ],
  edges: [
    {
      id: 'eA',
      source: 'n1',
      target: 'n2',
      duration: 3,
      activity_id: 'A',
    },
    {
      id: 'eB',
      source: 'n2',
      target: 'n3',
      duration: 2,
      activity_id: 'B',
    },
    {
      id: 'eC',
      source: 'n1',
      target: 'n3',
      duration: 5,
      activity_id: 'C',
    },
  ],
  activities: [
    {
      id: 'A',
      name: 'Actividad A',
      expected_time: 3,
      slack: 0,
      is_critical: true,
    },
    {
      id: 'B',
      name: 'Actividad B',
      expected_time: 2,
      slack: 0,
      is_critical: true,
    },
    {
      id: 'C',
      name: 'Actividad C',
      expected_time: 5,
      slack: 0,
      is_critical: true,
    },
  ],
  project_duration: 5,
}

describe('buildStepNarration', () => {
  it('formats subscripts with unicode digits', () => {
    expect(toSubscript(12)).toBe('₁₂')
  })

  it('explains the forward pass with the evaluated terms', () => {
    const narration = buildStepNarration(result, {
      type: 'forward',
      node_id: 'n3',
      labels: { E: 5 },
      snapshot: { E: { n1: 0, n2: 3, n3: 5 } },
    })

    expect(narration.formula).toBe(
      'E₃ = max(E₁ + te_C, E₂ + te_B) = max(0 + 5, 3 + 2) = 5',
    )
  })

  it('explains the backward pass with the evaluated terms', () => {
    const narration = buildStepNarration(result, {
      type: 'backward',
      node_id: 'n1',
      labels: { L: 0 },
      snapshot: { L: { n1: 0, n2: 3, n3: 5 } },
    })

    expect(narration.formula).toBe(
      'L₁ = min(L₂ − te_A, L₃ − te_C) = min(3 − 3, 5 − 5) = 0',
    )
  })

  it('summarizes definition and critical-activity steps', () => {
    expect(
      buildStepNarration(result, {
        type: 'forward',
        node_id: 'n1',
        labels: { E: 0 },
        snapshot: { E: { n1: 0 } },
      }).formula,
    ).toBe('E₁ = 0')

    expect(
      buildStepNarration(result, {
        type: 'critical',
        node_id: 'n2',
        highlight_edges: ['eA'],
      }).formula,
    ).toBe('H(A) = L₂ − E₁ − 3 = 0')
  })

  it('returns null for the final critical-path summary', () => {
    expect(
      buildStepNarration(result, {
        type: 'critical',
        node_id: null,
        highlight_edges: [],
      }),
    ).toBeNull()
  })
})
