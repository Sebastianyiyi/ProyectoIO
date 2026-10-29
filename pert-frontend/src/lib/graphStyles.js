const INDIGO = '#4f46e5'
const INDIGO_LIGHT = '#eef2ff'
const AMBER = '#f59e0b'
const AMBER_LIGHT = '#fffbeb'
const SKY = '#0ea5e9'
const SLATE_300 = '#cbd5e1'
const SLATE_400 = '#94a3b8'
const SLATE_600 = '#475569'

export const graphStyles = [
  {
    selector: 'node',
    style: {
      width: 66,
      height: 66,
      'background-color': '#ffffff',
      'border-width': 2,
      'border-color': SLATE_300,
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
    selector: 'edge',
    style: {
      width: 2,
      'line-color': SLATE_400,
      'target-arrow-color': SLATE_400,
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.1,
      'curve-style': 'bezier',
      label: 'data(label)',
      color: SLATE_600,
      'font-size': 11,
      'font-weight': 600,
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.9,
      'text-background-padding': '3px',
      'text-border-color': '#e2e8f0',
      'text-border-width': 1,
      'text-border-opacity': 1,
      'text-margin-y': -9,
      'transition-property':
        'line-color, target-arrow-color, width, opacity',
      'transition-duration': '180ms',
    },
  },
  {
    selector: 'edge.is-dummy',
    style: {
      'line-style': 'dashed',
      'line-dash-pattern': [6, 4],
      'line-color': SLATE_400,
      'target-arrow-color': SLATE_400,
      color: '#64748b',
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
]
