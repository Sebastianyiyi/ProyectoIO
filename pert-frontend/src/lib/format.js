const numberFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 4,
})

const durationFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function formatNumber(value, options = {}) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '—'
  }

  const formatter =
    options.maximumFractionDigits === 4 ? decimalFormatter : numberFormatter

  return formatter.format(number)
}

export function formatDuration(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const number = Number(value)
  return Number.isFinite(number) ? durationFormatter.format(number) : '—'
}

export function formatDecimal(value) {
  return formatNumber(value, { maximumFractionDigits: 4 })
}

export function formatProbability(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const number = Number(value)
  return Number.isFinite(number)
    ? `${(number * 100).toFixed(1)}%`
    : '—'
}

export function formatLabelValue(value) {
  return formatNumber(value)
}

export function formatStepValue(label, value) {
  if (value === null || value === undefined) {
    return null
  }

  return `${label} = ${formatNumber(value, { maximumFractionDigits: 4 })}`
}
