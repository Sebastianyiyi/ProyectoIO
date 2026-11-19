export function CpmStepExplanation({ step, index, total }) {
  const titles = { forward: 'Paso adelante', backward: 'Paso atrás', critical: 'Ruta crítica' }
  return (
    <section aria-label="Explicación del paso CPM" aria-live="polite" className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">{titles[step?.type] ?? 'Procedimiento CPM'} · Paso {index + 1} de {total}</p>
      <p className="mt-2 break-words font-mono text-xs font-bold leading-5 text-indigo-900">{step?.formula}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{step?.explanation}</p>
    </section>
  )
}
