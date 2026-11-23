import { describe, expect, it } from 'vitest'
import { buildGraphElements } from './graphElements'

const result = {
  nodes: [
    {
      id: 'n1',
      event: 1,
      x: 80,
      y: 110,
      is_source: true,
      is_sink: false,
    },
    {
      id: 'n2',
      event: 2,
      x: 310,
      y: 110,
      is_source: false,
      is_sink: true,
    },
  ],
  edges: [
    {
      id: 'act_A',
      source: 'n1',
      target: 'n2',
      label: 'A (2.00)',
      activity_id: 'A',
      is_dummy: false,
    },
    {
      id: 'dummy_1',
      source: 'n1',
      target: 'n2',
      label: 'f1 (0.00)',
      activity_id: null,
      is_dummy: true,
    },
  ],
}

describe('buildGraphElements', () => {
  it('returns an empty collection without a result', () => {
    expect(buildGraphElements(null)).toEqual([])
  })

  it('maps nodes with preset positions and base classes', () => {
    const elements = buildGraphElements(result)
    const nodes = elements.filter((element) => element.group === 'nodes')

    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toMatchObject({
      data: { id: 'n1', event: 1, E: null, L: null },
      position: { x: 80, y: 110 },
      classes: 'is-source',
    })
    expect(nodes[1].classes).toBe('is-sink')
  })

  it('maps real and dummy edges with their classes', () => {
    const elements = buildGraphElements(result)
    const edges = elements.filter((element) => element.group === 'edges')

    expect(edges).toHaveLength(2)
    expect(edges[0].data).toMatchObject({
      id: 'act_A',
      source: 'n1',
      target: 'n2',
      activityId: 'A',
    })
    expect(edges[0].classes).toBe('')
    expect(edges[1].classes).toBe('is-dummy')
  })
})
