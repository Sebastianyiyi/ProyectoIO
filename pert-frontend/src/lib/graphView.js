export const MIN_ZOOM = 0.2
export const MAX_ZOOM = 3
export const FIT_ZOOM_MAX = 1.6
export const FOCUS_ZOOM_MIN = 0.6
export const FOCUS_ZOOM_MAX = 1.8
export const ZOOM_STEP = 0.15
export const WHEEL_SENSITIVITY = 0.0015
export const VIEW_ANIMATION_MS = 320
export const FOCUS_PADDING = 150
export const FOCUS_PADDING_TOP = 180
export const FIT_PADDING = 70
export const FIT_PADDING_TOP = 130

const MAX_WHEEL_DELTA = 160

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function clampZoom(value) {
  return clamp(value, MIN_ZOOM, MAX_ZOOM)
}

export function normalizeWheelDelta(deltaY, deltaMode = 0, viewportHeight = 800) {
  const modeFactor = deltaMode === 1 ? 16 : deltaMode === 2 ? viewportHeight : 1
  return clamp(Number(deltaY) * modeFactor, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA)
}

export function getWheelZoomFactor(deltaY, deltaMode = 0, viewportHeight = 800) {
  return Math.exp(-normalizeWheelDelta(deltaY, deltaMode, viewportHeight) * WHEEL_SENSITIVITY)
}

export function computeViewportForBox({
  box,
  viewportWidth,
  viewportHeight,
  padding = FIT_PADDING,
  paddingTop = padding,
  paddingBottom = padding,
  paddingLeft = padding,
  paddingRight = padding,
  minZoom = MIN_ZOOM,
  maxZoom = FIT_ZOOM_MAX,
}) {
  if (!box || viewportWidth <= 0 || viewportHeight <= 0) {
    return null
  }

  const contentWidth = Math.max(box.w, 1)
  const contentHeight = Math.max(box.h, 1)
  const availableWidth = Math.max(
    viewportWidth - paddingLeft - paddingRight,
    1,
  )
  const availableHeight = Math.max(
    viewportHeight - paddingTop - paddingBottom,
    1,
  )
  const zoom = clamp(
    Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
    minZoom,
    maxZoom,
  )
  const centerX = box.x1 + box.w / 2
  const centerY = box.y1 + box.h / 2

  return {
    zoom,
    pan: {
      x:
        paddingLeft +
        (viewportWidth - paddingLeft - paddingRight) / 2 -
        centerX * zoom,
      y:
        paddingTop +
        (viewportHeight - paddingTop - paddingBottom) / 2 -
        centerY * zoom,
    },
  }
}

export function getViewportForElements(cy, elements, options = {}) {
  if (!cy || cy.destroyed() || !elements || elements.length === 0) {
    return null
  }

  return computeViewportForBox({
    box: elements.boundingBox(),
    viewportWidth: cy.width(),
    viewportHeight: cy.height(),
    ...options,
  })
}

export function getZoomedViewportAroundCenter(cy, targetZoom) {
  if (!cy || cy.destroyed()) {
    return null
  }

  const width = cy.width()
  const height = cy.height()
  const pan = cy.pan()
  const currentZoom = cy.zoom()
  const zoom = clampZoom(targetZoom)
  const center = {
    x: (width / 2 - pan.x) / currentZoom,
    y: (height / 2 - pan.y) / currentZoom,
  }

  return {
    zoom,
    pan: {
      x: width / 2 - center.x * zoom,
      y: height / 2 - center.y * zoom,
    },
  }
}

export function animateViewport(cy, viewport, duration = VIEW_ANIMATION_MS) {
  if (!cy || cy.destroyed() || !viewport) {
    return
  }

  cy.stop()
  cy.animate(
    {
      zoom: viewport.zoom,
      pan: viewport.pan,
    },
    {
      duration,
      easing: 'ease-in-out',
    },
  )
}

export function fitElements(cy, elements, options = {}) {
  if (!cy || cy.destroyed()) {
    return
  }

  const target = elements && elements.length > 0 ? elements : cy.elements()
  const viewport = getViewportForElements(cy, target, {
    maxZoom: FIT_ZOOM_MAX,
    padding: FIT_PADDING,
    paddingTop: FIT_PADDING_TOP,
    ...options,
  })

  if (options.animate === false) {
    if (viewport) {
      cy.zoom(viewport.zoom)
      cy.pan(viewport.pan)
    }
    return
  }

  animateViewport(cy, viewport, options.duration)
}
