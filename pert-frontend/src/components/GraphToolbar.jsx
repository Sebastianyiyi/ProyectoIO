import { Maximize2, Minus, Plus } from 'lucide-react'

function ToolButton({ label, onClick, children, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function GraphToolbar({ onZoomIn, onZoomOut, onFit, disabled = false }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <ToolButton label="Acercar zoom" onClick={onZoomIn} disabled={disabled}>
        <Plus className="size-4" aria-hidden="true" />
      </ToolButton>
      <ToolButton label="Alejar zoom" onClick={onZoomOut} disabled={disabled}>
        <Minus className="size-4" aria-hidden="true" />
      </ToolButton>
      <ToolButton label="Ajustar red a la vista" onClick={onFit} disabled={disabled}>
        <Maximize2 className="size-4" aria-hidden="true" />
      </ToolButton>
    </div>
  )
}
