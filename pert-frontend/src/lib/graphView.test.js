import { describe, expect, it } from 'vitest'
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clampZoom,
  computeViewportForBox,
  getWheelZoomFactor,
  normalizeWheelDelta,
} from './graphView'

describe('graphView', () => {
  it('clamps zoom values to the allowed range', () => {
    expect(clampZoom(0.01)).toBe(MIN_ZOOM)
    expect(clampZoom(10)).toBe(MAX_ZOOM)
    expect(clampZoom(1.2)).toBe(1.2)
  })

  it('normalizes wheel deltas for pixels, lines and pages', () => {
    expect(normalizeWheelDelta(100, 0, 800)).toBe(100)
    expect(normalizeWheelDelta(3, 1, 800)).toBe(48)
    expect(normalizeWheelDelta(1, 2, 800)).toBe(160)
    expect(normalizeWheelDelta(-1000, 0, 800)).toBe(-160)
  })

  it('turns small wheel movements into smooth zoom factors', () => {
    const zoomIn = getWheelZoomFactor(-100, 0, 800)
    const zoomOut = getWheelZoomFactor(100, 0, 800)

    expect(zoomIn).toBeGreaterThan(1)
    expect(zoomOut).toBeLessThan(1)
    expect(zoomIn).toBeCloseTo(1 / zoomOut, 5)
  })

  it('computes a centered viewport for a bounding box', () => {
    const viewport = computeViewportForBox({
      box: { x1: 0, y1: 0, w: 100, h: 50 },
      viewportWidth: 1000,
      viewportHeight: 500,
      padding: 50,
      maxZoom: 3,
    })

    expect(viewport).toEqual({
      zoom: 3,
      pan: { x: 350, y: 175 },
    })
  })

  it('reserves extra space at the top for canvas overlays', () => {
    const viewport = computeViewportForBox({
      box: { x1: 0, y1: 0, w: 100, h: 50 },
      viewportWidth: 1000,
      viewportHeight: 500,
      paddingTop: 100,
      paddingBottom: 50,
      paddingLeft: 50,
      paddingRight: 50,
      maxZoom: 3,
    })

    expect(viewport).toEqual({
      zoom: 3,
      pan: { x: 350, y: 200 },
    })
  })

  it('respects the maximum fit zoom and invalid inputs', () => {
    expect(
      computeViewportForBox({
        box: { x1: 0, y1: 0, w: 10, h: 10 },
        viewportWidth: 1000,
        viewportHeight: 500,
        maxZoom: 1.6,
      }).zoom,
    ).toBe(1.6)

    expect(
      computeViewportForBox({
        box: null,
        viewportWidth: 1000,
        viewportHeight: 500,
      }),
    ).toBeNull()
  })
})
