const INDIGO = '#4f46e5'
const INDIGO_LIGHT = '#eef2ff'
const AMBER = '#f59e0b'
const AMBER_LIGHT = '#fffbeb'
const SKY = '#0ea5e9'
const SLATE_300 = '#cbd5e1'
const SLATE_400 = '#94a3b8'
const SLATE_500 = '#64748b'
const SLATE_600 = '#475569'

export const graphStyles = [
  {
    selector: 'node',
    style: {
      width: 84,
      height: 84,
      'background-color': '#ffffff',
      'border-width': 2,
      'border-color': SLATE_300,
      'underlay-shape': 'ellipse',
      'overlay-opacity': 0,
      'transition-property':
        'background-color, border-color, border-width, opacity',
      'transition-duration': '180ms',
    },
  },
  {
    selector: 'node.is-source',
    style: {
      'background-color': INDIGO_LIGHT,
      'border-color': INDIGO,
    },
  },
  {
    selector: 'node.is-sink',
    style: {
      'background-color': '#ecfdf5',
      'border-color': '#10b981',
    },
  },
  {
    selector: 'node.is-critical',
    style: {
      'background-color': AMBER_LIGHT,
      'border-color': AMBER,
      'border-width': 4,
      'underlay-color': AMBER,
      'underlay-opacity': 0.16,
      'underlay-padding': 8,
    },
  },
  {
    selector: 'node.is-highlight',
    style: {
      'background-color': '#eef2ff',
      'border-color': INDIGO,
      'border-width': 4,
      'underlay-color': INDIGO,
      'underlay-opacity': 0.16,
      'underlay-padding': 8,
    },
  },
  {
    selector: 'node.is-current',
    style: {
      'background-color': '#f0f9ff',
      'border-color': SKY,
      'border-width': 5,
      'underlay-color': SKY,
      'underlay-opacity': 0.24,
      'underlay-padding': 10,
    },
  },
  {
    selector: 'node.is-dimmed',
    style: {
      opacity: 0.15,
    },
  },
  {
    selector: 'node.is-active',
    style: {
      'border-color': SKY,
      'border-width': 4,
      'underlay-color': SKY,
      'underlay-opacity': 0.24,
      'underlay-padding': 12,
      'z-index': 20,
    },
  },
  {
    selector: 'node.is-active.is-critical',
    style: {
      'border-color': AMBER,
      'underlay-color': AMBER,
      'underlay-opacity': 0.24,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': SLATE_400,
      'line-cap': 'round',
      'target-arrow-color': SLATE_400,
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.1,
      'curve-style': 'bezier',
      label: 'data(label)',
      color: SLATE_600,
      'font-size': 13.5,
      'font-weight': 600,
      'text-background-color': '#ffffff',
      'text-background-opacity': 1,
      'text-background-padding': '5px',
      'text-background-shape': 'round-rectangle',
      'text-border-color': '#cbd5e1',
      'text-border-width': 1,
      'text-border-opacity': 1,
      'text-margin-x': 'data(labelOffsetX)',
      'text-margin-y': 'data(labelOffsetY)',
      'text-max-width': '132px',
      'text-wrap': 'wrap',
      'transition-property':
        'line-color, target-arrow-color, width, opacity',
      'transition-duration': '180ms',
    },
  },
  {
    selector: 'edge.is-curved',
    style: {
      'curve-style': 'unbundled-bezier',
      'control-point-distances': 'data(controlPointDistance)',
      'control-point-weights': 0.5,
    },
  },
  {
    selector: 'edge.is-dummy',
    style: {
      width: 2.5,
      'line-style': 'dashed',
      'line-dash-pattern': [10, 6],
      'line-color': SLATE_500,
      'target-arrow-color': SLATE_500,
      color: SLATE_500,
    },
  },
  {
    selector: 'edge.is-highlight',
    style: {
      width: 4,
      'line-color': INDIGO,
      'target-arrow-color': INDIGO,
      color: INDIGO,
      'text-border-color': '#c7d2fe',
    },
  },
  {
    selector: 'edge.is-critical',
    style: {
      width: 4.5,
      'line-color': AMBER,
      'target-arrow-color': AMBER,
      color: '#92400e',
      'text-background-color': AMBER_LIGHT,
      'text-border-color': '#fde68a',
    },
  },
  {
    selector: 'edge.is-dimmed',
    style: {
      opacity: 0.15,
    },
  },
  {
    selector: 'edge.is-active',
    style: {
      width: 5,
      'line-color': SKY,
      'target-arrow-color': SKY,
      color: '#0369a1',
      'text-border-color': '#bae6fd',
      'z-index': 20,
    },
  },
  {
    selector: 'edge.is-active.is-critical',
    style: {
      width: 5.5,
      'line-color': AMBER,
      'target-arrow-color': AMBER,
      color: '#92400e',
      'text-background-color': AMBER_LIGHT,
      'text-border-color': '#fde68a',
    },
  },
]
