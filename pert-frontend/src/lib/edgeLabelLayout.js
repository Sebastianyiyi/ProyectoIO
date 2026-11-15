const EPSILON = 1e-6
const CURVE_DISTANCE = 28
const LABEL_HEIGHT = 24
const LABEL_GAP = 6

function cross(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
}

function getPositionMap(nodes) {
  return new Map((nodes ?? []).map((node) => [node.id, node]))
}

function getSegment(edge, positions) {
  const source = positions.get(edge.source)
  const target = positions.get(edge.target)

  if (!source || !target) {
    return null
  }

  return {
    x1: Number(source.x),
    y1: Number(source.y),
    x2: Number(target.x),
    y2: Number(target.y),
  }
}

function getIntersection(first, second) {
  const denominator =
    (first.x1 - first.x2) * (second.y1 - second.y2) -
    (first.y1 - first.y2) * (second.x1 - second.x2)

  if (Math.abs(denominator) < EPSILON) {
    return null
  }

  const firstSide = cross(
    first.x1,
    first.y1,
    first.x2,
    first.y2,
    second.x1,
    second.y1,
  )
  const secondSide = cross(
    first.x1,
    first.y1,
    first.x2,
    first.y2,
    second.x2,
    second.y2,
  )
  const thirdSide = cross(
    second.x1,
    second.y1,
    second.x2,
    second.y2,
    first.x1,
    first.y1,
  )
  const fourthSide = cross(
    second.x1,
    second.y1,
    second.x2,
    second.y2,
    first.x2,
    first.y2,
  )

  if (
    firstSide * secondSide >= 0 ||
    thirdSide * fourthSide >= 0
  ) {
    return null
  }

  const t =
    ((first.x1 - second.x1) * (second.y1 - second.y2) -
      (first.y1 - second.y1) * (second.x1 - second.x2)) /
    denominator

  return {
    x: first.x1 + (first.x2 - first.x1) * t,
    y: first.y1 + (first.y2 - first.y1) * t,
  }
}

function baseOffset(segment) {
  const deltaY = segment.y2 - segment.y1

  if (Math.abs(deltaY) <= 12) {
    return { offsetX: 0, offsetY: -14 }
  }

  return {
    offsetX: 0,
    offsetY: deltaY > 0 ? -16 : 16,
  }
}

function labelBox(edge, segment, labelLayout) {
  const width = Math.min(128, 28 + String(edge.label ?? edge.id).length * 7)

  return {
    left: (segment.x1 + segment.x2) / 2 + labelLayout.offsetX - width / 2,
    right: (segment.x1 + segment.x2) / 2 + labelLayout.offsetX + width / 2,
    top: (segment.y1 + segment.y2) / 2 + labelLayout.offsetY - LABEL_HEIGHT / 2,
    bottom:
      (segment.y1 + segment.y2) / 2 + labelLayout.offsetY + LABEL_HEIGHT / 2,
  }
}

function overlaps(first, second) {
  return !(
    first.right + LABEL_GAP < second.left ||
    second.right + LABEL_GAP < first.left ||
    first.bottom + LABEL_GAP < second.top ||
    second.bottom + LABEL_GAP < first.top
  )
}

function chooseCurvedEdge(first, second) {
  if (first.isDummy !== second.isDummy) {
    return first.isDummy ? first : second
  }

  return first.label.length >= second.label.length ? first : second
}

export function computeEdgeLabelLayout(nodes, edges) {
  const positions = getPositionMap(nodes)
  const entries = (edges ?? [])
    .map((edge) => {
      const segment = getSegment(edge, positions)
      if (!segment) {
        return null
      }

      return {
        edge,
        segment,
        layout: {
          ...baseOffset(segment),
          controlPointDistance: 0,
        },
      }
    })
    .filter(Boolean)

  for (let index = 0; index < entries.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < entries.length; nextIndex += 1) {
      const current = entries[index]
      const next = entries[nextIndex]

      if (
        current.edge.source === next.edge.source ||
        current.edge.target === next.edge.target
      ) {
        continue
      }

      if (!getIntersection(current.segment, next.segment)) {
        continue
      }

      if (Math.sign(current.layout.offsetY) === Math.sign(next.layout.offsetY)) {
        next.layout.offsetY = -next.layout.offsetY
      }

      const curved = chooseCurvedEdge(current.edge, next.edge)
      const curvedLayout =
        curved === current.edge ? current.layout : next.layout

      curvedLayout.controlPointDistance =
        curved === current.edge ? CURVE_DISTANCE : -CURVE_DISTANCE
    }
  }

  for (let index = 0; index < entries.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < entries.length; nextIndex += 1) {
      const current = entries[index]
      const next = entries[nextIndex]

      if (
        !overlaps(
          labelBox(current.edge, current.segment, current.layout),
          labelBox(next.edge, next.segment, next.layout),
        )
      ) {
        continue
      }

      const direction =
        next.layout.offsetY >= current.layout.offsetY ? 1 : -1
      next.layout.offsetY += direction * (LABEL_HEIGHT + LABEL_GAP)
    }
  }

  return Object.fromEntries(
    entries.map(({ edge, layout }) => [edge.id, layout]),
  )
}

export function applyEdgeLabelLayout(cy) {
  if (!cy || cy.destroyed()) {
    return
  }

  const nodes = cy.nodes().map((node) => ({
    id: node.id(),
    x: node.position('x'),
    y: node.position('y'),
  }))
  const edges = cy.edges().map((edge) => ({
    id: edge.id(),
    source: edge.source().id(),
    target: edge.target().id(),
    label: edge.data('label') ?? '',
    isDummy: edge.hasClass('is-dummy'),
  }))
  const layout = computeEdgeLabelLayout(nodes, edges)

  cy.batch(() => {
    cy.edges().forEach((edge) => {
      const values = layout[edge.id()] ?? {
        offsetX: 0,
        offsetY: 0,
        controlPointDistance: 0,
      }

      edge.data('labelOffsetX', values.offsetX)
      edge.data('labelOffsetY', values.offsetY)
      edge.data('controlPointDistance', values.controlPointDistance)

      if (Math.abs(values.controlPointDistance) > 0) {
        edge.addClass('is-curved')
      } else {
        edge.removeClass('is-curved')
      }
    })
  })
}
