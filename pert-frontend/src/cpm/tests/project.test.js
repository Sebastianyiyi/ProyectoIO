import { describe, expect, it } from 'vitest'
import { activitiesFromExample, createActivity, parseDuration, toPayload, updateActivity, validateProject } from '../lib/project'
import fixtures from './fixtures/projects.json'

describe('CPM project data', () => {
  it('sends only a fixed duration per activity', () => {
    const rows = activitiesFromExample(fixtures.cpm.request)
    expect(toPayload(rows)).toEqual(fixtures.cpm.request)
    expect(validateProject(rows).valid).toBe(true)
    expect(rows[0]).not.toHaveProperty('a')
    expect(rows[0]).not.toHaveProperty('m')
    expect(rows[0]).not.toHaveProperty('b')
  })

  it('supports zero and decimal commas', () => {
    expect(parseDuration('0')).toBe(0)
    expect(parseDuration('1,5')).toBe(1.5)
    expect(validateProject([createActivity({ id: 'A', duration: '1,5' })]).valid).toBe(true)
  })

  it.each(['', '-1', 'abc', 'Infinity'])('rejects an invalid duration: %s', (duration) => {
    const row = createActivity({ id: 'A', duration })
    expect(validateProject([row]).byKey[row.key].duration).toBeTruthy()
  })

  it('requires a nonempty list with unique identifiers', () => {
    expect(validateProject([]).valid).toBe(false)
    expect(validateProject([createActivity({ duration: '1' })]).valid).toBe(false)
    const duplicate = [createActivity({ id: 'A', duration: '1' }), createActivity({ id: 'A', duration: '2' })]
    expect(Object.keys(validateProject(duplicate).byKey)).toHaveLength(2)
  })

  it('rejects unknown predecessors, self-dependencies and cycles', () => {
    expect(validateProject([createActivity({ id: 'A', duration: '1', predecessors: ['Z'] })]).valid).toBe(false)
    expect(validateProject([createActivity({ id: 'A', duration: '1', predecessors: ['A'] })]).valid).toBe(false)
    const cycle = [createActivity({ id: 'A', duration: '1', predecessors: ['B'] }), createActivity({ id: 'B', duration: '1', predecessors: ['A'] })]
    expect(validateProject(cycle).general.join(' ')).toMatch(/ciclo/)
  })

  it('renames references when an activity identifier changes', () => {
    const a = createActivity({ id: 'A', duration: '1' })
    const b = createActivity({ id: 'B', duration: '2', predecessors: ['A'] })
    expect(updateActivity([a, b], a.key, { id: 'X' })[1].predecessors).toEqual(['X'])
  })
})
