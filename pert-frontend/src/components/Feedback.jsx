import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

export function ErrorAlert({ message, onRetry }) {
  if (!message) {
    return null
  }

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">No se pudo completar la operación</p>
        <p className="mt-1 leading-5 text-rose-700">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Reintentar
        </button>
      ) : null}
    </div>
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
