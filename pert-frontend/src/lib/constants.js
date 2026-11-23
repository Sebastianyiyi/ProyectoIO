export const ANIMATION_INTERVAL_MS = 2400
export const ANIMATION_SPEED_MIN = 0.5
export const ANIMATION_SPEED_MAX = 2
export const ANIMATION_SPEED_STEP = 0.25
export const ANIMATION_SPEED_DEFAULT = 1
export const STEP_TOOLTIP_TYPING_MS = 900
export const STEP_TOOLTIP_HOLD_MS = 1500
export const STEP_TOOLTIP_FADE_MS = 300

export const STEP_TYPES = {
  forward: {
    label: 'Paso adelante',
    badge: 'bg-sky-100 text-sky-800 ring-sky-200',
    accent: 'text-sky-700',
  },
  backward: {
    label: 'Paso atrás',
    badge: 'bg-violet-100 text-violet-800 ring-violet-200',
    accent: 'text-violet-700',
  },
  critical: {
    label: 'Ruta crítica',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    accent: 'text-amber-700',
  },
}

export const EMPTY_MESSAGES = {
  noResult: 'Resuelve un proyecto para visualizar la red AOA y animar el algoritmo.',
  noSteps: 'Este proyecto no generó pasos de animación.',
}
