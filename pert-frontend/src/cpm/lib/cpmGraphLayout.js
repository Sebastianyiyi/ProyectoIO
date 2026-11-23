const NODE_CLEARANCE_X = 36
const NODE_CLEARANCE_Y = 92
const CURVE_MIN_OFFSET = 140
const CURVE_MAX_OFFSET = 220

function distancePointToSegmentY(px, py, x1, y1, x2, y2) {
  if (Math.abs(x2 - x1) < 1e-6) {
    return 0
  }

  const t = (px - x1) / (x2 - x1)
  return py - (y1 + (y2 - y1) * t)
}

export function expandCpmParallelNodes(cy) {
  if (!cy || cy.destroyed()) {
    return
  }

  const nodes = cy.nodes().map((node) => ({
    node,
    id: node.id(),
    x: node.position('x'),
    y: node.position('y'),
  }))

  cy.edges().forEach((edge) => {
    const src = edge.source()
    const tgt = edge.target()
    const x1 = src.position('x')
    const y1 = src.position('y')
    const x2 = tgt.position('x')
    const y2 = tgt.position('y')

    if (x2 - x1 <= 160) {
      return
    }

    const intermediates = nodes.filter(
      (item) =>
        item.id !== src.id() &&
        item.id !== tgt.id() &&
        item.x > x1 + NODE_CLEARANCE_X &&
        item.x < x2 - NODE_CLEARANCE_X,
    )

    for (const item of intermediates) {
      const deltaY = distancePointToSegmentY(item.x, item.y, x1, y1, x2, y2)
      if (Math.abs(deltaY) >= NODE_CLEARANCE_Y) {
        continue
      }

      const lineY = item.y - deltaY
      const direction = deltaY >= 0 ? 1 : -1
      const targetY = lineY + direction * NODE_CLEARANCE_Y
      const blocked = nodes.some(
        (other) =>
          other.id !== item.id &&
          Math.abs(other.x - item.x) < 40 &&
          Math.abs(other.y - targetY) < 96,
      )

      if (!blocked) {
        item.y = targetY
        item.node.position('y', targetY)
      }
    }
  })
}

export function curveCpmSkipEdges(cy) {
  if (!cy || cy.destroyed()) {
    return
  }

  const nodes = cy.nodes().map((node) => ({
    id: node.id(),
    x: node.position('x'),
    y: node.position('y'),
  }))

  cy.batch(() => {
    cy.edges().forEach((edge) => {
      const src = edge.source()
      const tgt = edge.target()
      const x1 = src.position('x')
      const y1 = src.position('y')
      const x2 = tgt.position('x')
      const y2 = tgt.position('y')

      if (x2 - x1 <= 160) {
        return
      }

      const blocking = nodes.filter((item) => {
        if (item.id === src.id() || item.id === tgt.id()) {
          return false
        }
        if (item.x <= x1 + NODE_CLEARANCE_X || item.x >= x2 - NODE_CLEARANCE_X) {
          return false
        }
        return Math.abs(distancePointToSegmentY(item.x, item.y, x1, y1, x2, y2)) < 115
      })

      if (blocking.length === 0) {
        return
      }

      const avgDeltaY =
        blocking.reduce(
          (sum, item) => sum + distancePointToSegmentY(item.x, item.y, x1, y1, x2, y2),
          0,
        ) / blocking.length

      const curveSign = avgDeltaY >= 0 ? -1 : 1
      const existingDist = Number(edge.data('controlPointDistance') || 0)
      const spanScale = Math.min(
        CURVE_MAX_OFFSET,
        Math.max(CURVE_MIN_OFFSET, (x2 - x1) * 0.55),
      )
      const distance =
        Math.abs(existingDist) >= CURVE_MIN_OFFSET
          ? existingDist
          : curveSign * Math.round(spanScale)

      edge.data('controlPointDistance', distance)
      edge.data('labelOffsetY', curveSign < 0 ? -4 : 4)
      edge.addClass('is-curved')
    })
  })
}
