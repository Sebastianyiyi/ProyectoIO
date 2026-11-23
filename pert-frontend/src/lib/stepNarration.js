import { formatNumber } from './format'
import { buildStepCalculation } from './stepCalculations'

const SUBSCRIPT_DIGITS = {
  0: '₀',
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
}

export function toSubscript(value) {
  return String(value ?? '')
    .split('')
    .map((character) => SUBSCRIPT_DIGITS[character] ?? character)
    .join('')
}

function termName(term) {
  return term.isDummy ? term.label : `te_${term.label}`
}

function buildTermFormula(calculation, term) {
  const isForward = calculation.phase === 'forward'
  const operator = isForward ? '+' : '−'
  const baseLabel = isForward ? 'E' : 'L'
  const event = isForward ? term.sourceEvent : term.targetEvent

  return {
    symbolic: `${baseLabel}${toSubscript(event)} ${operator} ${termName(term)}`,
    numeric: `${formatNumber(term.baseValue)} ${operator} ${formatNumber(term.duration)}`,
    result: formatNumber(term.result),
  }
}

export function buildStepNarration(result, step) {
  if (!result || !step) {
    return null
  }

  if (step.type === 'critical' && !step.node_id) {
    return null
  }

  const calculation = buildStepCalculation(result, step)
  if (!calculation || calculation.kind === 'summary') {
    return null
  }

  const nodeEvent = calculation.node?.event ?? null

  if (calculation.kind === 'definition') {
    const isForward = calculation.phase === 'forward'
    return {
      type: step.type,
      nodeEvent,
      formula: isForward
        ? `E${toSubscript(nodeEvent)} = ${formatNumber(calculation.value)}`
        : `L${toSubscript(nodeEvent)} = E${toSubscript(nodeEvent)} = ${formatNumber(calculation.value)}`,
    }
  }

  if (calculation.kind === 'critical') {
    const activity = calculation.activity
    return {
      type: step.type,
      nodeEvent: activity.endEvent,
      formula: `H(${activity.id}) = L${toSubscript(activity.endEvent)} − E${toSubscript(activity.startEvent)} − ${formatNumber(activity.duration)} = ${formatNumber(activity.slack)}`,
    }
  }

  const isForward = calculation.phase === 'forward'
  const operator = isForward ? 'max' : 'min'
  const baseLabel = isForward ? 'E' : 'L'
  const terms = calculation.terms.map((term) =>
    buildTermFormula(calculation, term),
  )

  return {
    type: step.type,
    nodeEvent,
    formula: `${baseLabel}${toSubscript(nodeEvent)} = ${operator}(${terms
      .map((term) => term.symbolic)
      .join(', ')}) = ${operator}(${terms
      .map((term) => term.numeric)
      .join(', ')}) = ${formatNumber(calculation.value)}`,
  }
}
