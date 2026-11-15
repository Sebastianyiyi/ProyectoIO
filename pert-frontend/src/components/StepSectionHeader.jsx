export function StepSectionHeader({
  stepNumber,
  title,
  subtitle,
  badge = null,
  actions = null,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/60 p-5 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 font-mono text-sm font-black text-white shadow-sm shadow-indigo-300">
          {stepNumber}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              {title}
            </h2>
            {badge ? <div>{badge}</div> : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
