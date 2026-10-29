import { describe, expect, it } from 'vitest'
import {
  activitiesFromExample,
  applyActivityPatch,
  createActivity,
  removeActivityFromList,
  toPertPayload,
} from './activities'

describe('activity helpers', () => {
  it('maps an API example to editable rows', () => {
    const activities = activitiesFromExample({
      activities: [
        {
          id: 'A',
          name: 'Inicio',
          predecessors: [],
          a: 1,
          m: 2,
          b: 3,
        },
      ],
      target_time: 8,
    })

    expect(activities).toHaveLength(1)
    expect(activities[0]).toMatchObject({
      id: 'A',
      name: 'Inicio',
      predecessors: [],
      a: '1',
      m: '2',
      b: '3',
    })
    expect(activities[0].key).toBeTruthy()
  })

  it('converts rows to the API payload', () => {
    const activities = [
      createActivity({
        id: ' A ',
        name: ' Inicio ',
        predecessors: [' X ', ''],
        a: '1',
        m: '2',
        b: '3',
      }),
    ]

    expect(toPertPayload(activities, '13')).toEqual({
      activities: [
        {
          id: 'A',
          name: 'Inicio',
          predecessors: ['X'],
          a: 1,
          m: 2,
          b: 3,
        },
      ],
      target_time: 13,
    })
  })

  it('renames references when an identifier changes', () => {
    const activities = [
      createActivity({ id: 'A' }),
      createActivity({ id: 'B', predecessors: ['A'] }),
    ]

    const renamed = applyActivityPatch(activities, activities[0].key, {
      id: 'X',
    })

    expect(renamed[0].id).toBe('X')
    expect(renamed[1].predecessors).toEqual(['X'])
  })

  it('removes references to a deleted activity', () => {
    const activities = [
      createActivity({ id: 'A' }),
      createActivity({ id: 'B', predecessors: ['A'] }),
    ]

    const remaining = removeActivityFromList(activities, activities[0].key)

    expect(remaining).toHaveLength(1)
    expect(remaining[0].predecessors).toEqual([])
  })
})
