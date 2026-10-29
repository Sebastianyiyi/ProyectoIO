export function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-full border-2 border-slate-300 bg-white" />
        Evento
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-5 bg-slate-400" />
        Actividad real
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-5 border-t-2 border-dashed border-slate-400" />
        Actividad ficticia
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-5 bg-amber-500" />
        Ruta crítica
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-full border-2 border-indigo-500 bg-indigo-50" />
        Paso actual
      </span>
    </div>
  )
}
