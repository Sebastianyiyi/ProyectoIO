import { describe, expect, it } from 'vitest'
import { getStepVisibility } from './graphVisibility'

const result = {
  nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3' },
  ],
}

describe('getStepVisibility', () => {
  it('keeps every element visible in overview mode', () => {
    const visibility = getStepVisibility(
      result,
      {
        type: 'forward',
        node_id: 'n2',
        highlight_nodes: ['n2'],
        highlight_edges: ['e1'],
        snapshot: { E: { n1: 0, n2: 3 }, L: {} },
      },
      'overview',
    )

    expect(visibility.dimmedNodeIds).toEqual([])
    expect(visibility.dimmedEdgeIds).toEqual([])
    expect(visibility.activeNodeIds).toContain('n2')
    expect(visibility.activeEdgeIds).toContain('e1')
  })

  it('dims nodes and edges not processed in forward mode', () => {
    const visibility = getStepVisibility(
      result,
      {
        type: 'forward',
        node_id: 'n2',
        highlight_nodes: ['n2', 'n1'],
        highlight_edges: ['e1'],
        snapshot: { E: { n1: 0, n2: 3 }, L: {} },
      },
      'focus',
    )

    expect(visibility.dimmedNodeIds).toEqual(['n3'])
    expect(visibility.dimmedEdgeIds).toEqual(['e2'])
  })

  it('dims elements not processed in backward mode', () => {
    const visibility = getStepVisibility(
      result,
      {
        type: 'backward',
        node_id: 'n2',
        highlight_nodes: ['n2'],
        highlight_edges: [],
        snapshot: { E: {}, L: { n3: 5, n2: 3 } },
      },
      'focus',
    )

    expect(visibility.dimmedNodeIds).toEqual(['n1'])
    expect(visibility.dimmedEdgeIds).toEqual(['e1'])
  })

  it('keeps the whole critical network visible', () => {
    const visibility = getStepVisibility(
      result,
      {
        type: 'critical',
        node_id: null,
        highlight_nodes: ['n1', 'n2', 'n3'],
        highlight_edges: ['e1', 'e2'],
        snapshot: { E: {}, L: {} },
      },
      'focus',
    )

    expect(visibility.dimmedNodeIds).toEqual([])
    expect(visibility.dimmedEdgeIds).toEqual([])
    expect(visibility.focusNodeIds).toEqual(['n1', 'n2', 'n3'])
  })
})
