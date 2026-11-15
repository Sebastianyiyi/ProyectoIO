import { AlertCircle, Loader2, RefreshCw, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

export function ErrorModal({
  open,
  title = 'No se pudo completar la operación',
  messages = [],
  onClose,
  onRetry,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const visibleMessages = messages.filter(Boolean)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) {
      return undefined
    }

    previousFocusRef.current = document.activeElement
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )

      if (!focusable || focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      previousFocusRef.current?.focus?.()
    }
  }, [open])

  if (!open || visibleMessages.length === 0) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-5 shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200">
            <AlertCircle className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-base font-black tracking-tight text-slate-900"
            >
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-1 text-xs leading-5 text-slate-500"
            >
              Corrige lo siguiente y vuelve a intentarlo.
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar errores"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-4 max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-xs leading-5 text-rose-800">
          {visibleMessages.map((message) => (
            <li key={message} className="flex gap-2">
              <span
                className="mt-2 size-1 shrink-0 rounded-full bg-rose-400"
                aria-hidden="true"
              />
              <span>{message}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              <RefreshCw className="size-3" aria-hidden="true" />
              Reintentar
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function LoadingSpinner({ label = 'Procesando…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${className}`}>
      <Loader2 className="size-4 animate-spin text-indigo-600" aria-hidden="true" />
      {label}
    </div>
  )
}
