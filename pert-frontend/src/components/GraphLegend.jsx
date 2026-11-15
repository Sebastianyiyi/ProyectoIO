function LegendPill({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500 shadow-sm backdrop-blur-md">
      {children}
    </span>
  )
}

export function GraphLegend({ showDimmed = false }) {
  return (
    <div className="flex max-w-[440px] flex-wrap items-center gap-1.5">
      <LegendPill>
        <span className="size-2.5 rounded-full border-2 border-slate-300 bg-white" />
        Evento
      </LegendPill>
      <LegendPill>
        <span className="h-0.5 w-4 bg-slate-400" />
        Actividad
      </LegendPill>
      <LegendPill>
        <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" />
        Ficticia
      </LegendPill>
      <LegendPill>
        <span className="h-0.5 w-4 bg-amber-500" />
        Crítica
      </LegendPill>
      <LegendPill>
        <span className="size-2.5 rounded-full border-2 border-sky-500 bg-sky-100" />
        Activo
      </LegendPill>
      {showDimmed ? (
        <LegendPill>
          <span className="size-2.5 rounded-full border-2 border-slate-200 bg-white opacity-40" />
          Sin procesar
        </LegendPill>
      ) : null}
    </div>
  )
}
