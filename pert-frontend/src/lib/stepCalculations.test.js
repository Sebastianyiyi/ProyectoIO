import { describe, expect, it } from 'vitest'
import { buildStepCalculation } from './stepCalculations'

const result = {
  project_duration: 5,
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
      is_dummy: false,
      label: 'A (3.00)',
    },
    {
      id: 'eB',
      source: 'n2',
      target: 'n3',
      duration: 2,
      activity_id: 'B',
      is_dummy: false,
      label: 'B (2.00)',
    },
    {
      id: 'eC',
      source: 'n1',
      target: 'n3',
      duration: 5,
      activity_id: 'C',
      is_dummy: false,
      label: 'C (5.00)',
    },
    {
      id: 'eD',
      source: 'n1',
      target: 'n3',
      duration: 0,
      activity_id: null,
      is_dummy: true,
      dummy_label: 'f1',
      label: 'f1 (0.00)',
    },
  ],
  activities: [
    {
      id: 'A',
      name: 'Actividad A',
      expected_time: 3,
      slack: 0,
      start_event: 1,
      end_event: 2,
    },
  ],
  critical_path: ['A', 'B'],
}

describe('buildStepCalculation', () => {
  it('builds forward terms and marks every maximum', () => {
    const calculation = buildStepCalculation(
      result,
      {
        type: 'forward',
        node_id: 'n3',
        labels: { E: 5 },
        snapshot: { E: { n1: 0, n2: 3, n3: 5 }, L: {} },
        highlight_edges: ['eB', 'eC'],
      },
      4,
    )

    expect(calculation.kind).toBe('terms')
    expect(calculation.operator).toBe('max')
    expect(calculation.stepNumber).toBe(5)
    expect(calculation.value).toBe(5)
    expect(calculation.terms).toHaveLength(3)
    expect(
      calculation.terms.filter((term) => term.isBest).map((term) => term.edgeId),
    ).toEqual(expect.arrayContaining(['eB', 'eC']))
    expect(calculation.terms.find((term) => term.edgeId === 'eD')).toMatchObject({
      label: 'f1',
      isDummy: true,
      baseValue: 0,
      result: 0,
    })
  })

  it('builds backward terms and marks every minimum', () => {
    const calculation = buildStepCalculation(
      result,
      {
        type: 'backward',
        node_id: 'n1',
        labels: { L: 0 },
        snapshot: { E: {}, L: { n3: 5, n2: 3, n1: 0 } },
      },
      8,
    )

    expect(calculation.kind).toBe('terms')
    expect(calculation.operator).toBe('min')
    expect(calculation.value).toBe(0)
    expect(
      calculation.terms.filter((term) => term.isBest).map((term) => term.edgeId),
    ).toEqual(['eA', 'eC'])
  })

  it('describes source and sink boundary definitions', () => {
    const source = buildStepCalculation(
      result,
      {
        type: 'forward',
        node_id: 'n1',
        labels: { E: 0 },
        snapshot: { E: { n1: 0 }, L: {} },
      },
      0,
    )
    const sink = buildStepCalculation(
      result,
      {
        type: 'backward',
        node_id: 'n3',
        labels: { L: 5 },
        snapshot: { E: {}, L: { n3: 5 } },
      },
      7,
    )

    expect(source).toMatchObject({ kind: 'definition', value: 0 })
    expect(sink).toMatchObject({ kind: 'definition', value: 5 })
  })

  it('builds critical activity metrics', () => {
    const calculation = buildStepCalculation(
      result,
      {
        type: 'critical',
        node_id: 'n2',
        highlight_edges: ['eA'],
        snapshot: { E: {}, L: {} },
      },
      10,
    )

    expect(calculation.kind).toBe('critical')
    expect(calculation.activity).toMatchObject({
      id: 'A',
      duration: 3,
      slack: 0,
      startEvent: 1,
      endEvent: 2,
    })
  })

  it('builds the final critical path summary', () => {
    const calculation = buildStepCalculation(
      result,
      {
        type: 'critical',
        node_id: null,
        highlight_edges: [],
        snapshot: { E: {}, L: {} },
      },
      11,
    )

    expect(calculation).toMatchObject({
      kind: 'summary',
      criticalPath: ['A', 'B'],
      projectDuration: 5,
    })
  })
})
