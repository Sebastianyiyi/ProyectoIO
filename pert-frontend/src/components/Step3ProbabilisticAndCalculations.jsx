import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { PertCalculationsTable } from './PertCalculationsTable'
import {
  formatDecimal,
  formatDuration,
  formatPercent,
} from '../lib/format'

export function Step3ProbabilisticAndCalculations({
  result,
  onPrev,
  onNext,
}) {
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">
          Aún no hay resultados calculados.
        </p>
      </div>
    )
  }

  const prob = result?.probability
  const hasTarget =
    prob?.target_time !== null && prob?.target_time !== undefined

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7 space-y-5 max-w-6xl mx-auto w-full flex flex-col justify-between">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Paso 03 · Tiempos y Probabilidad
            </span>
            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              Resultados Completos y Probabilidad del Proyecto
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-3.5" />
            Cálculos Generados
          </span>
        </div>

        {/* 1. Tarjeta de Análisis Probabilístico (Banner Horizontal) */}
        <section
          aria-label="Tarjeta de análisis probabilístico"
          className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 via-white to-indigo-50/60 p-4 sm:p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-emerald-100 pb-2">
            <Sparkles className="size-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Análisis Probabilístico del Proyecto (Distribución Normal)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Tiempo objetivo T - solo si existe */}
            {hasTarget && (
              <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Tiempo Objetivo (T)
                </span>
                <p className="mt-1 font-mono text-xl font-black text-sky-800 sm:text-2xl">
                  {formatDuration(prob.target_time)}
                </p>
                <span className="mt-0.5 block text-[10px] text-sky-600">
                  Plazo objetivo ingresado
                </span>
              </div>
            )}

            {/* P(T <= t) */}
            <div className="rounded-xl border border-emerald-200 bg-white/90 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                P(T ≤ {hasTarget ? prob.target_time : 't'})
              </span>
              <p className="mt-1 font-mono text-xl font-black text-emerald-700 sm:text-2xl">
                {formatPercent(prob?.probability)}
              </p>
              <span className="mt-0.5 block text-[10px] font-semibold text-emerald-600">
                Probabilidad acumulada
              </span>
            </div>

            {/* Valor Z */}
            <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Valor Z
              </span>
              <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
                {formatDecimal(prob?.z_score, 4)}
              </p>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Z = (T − μ) / σ
              </span>
            </div>

            {/* Media μ */}
            <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Media (μ)
              </span>
              <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
                {formatDuration(prob?.mean)}
              </p>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Duración media TE
              </span>
            </div>

            {/* Desviación σ */}
            <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Desviación (σ)
              </span>
              <p className="mt-1 font-mono text-xl font-black text-slate-800 sm:text-2xl">
                {formatDecimal(prob?.standard_deviation, 4)}
              </p>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Desv. estándar
              </span>
            </div>
          </div>
        </section>

        {/* 2. Tabla General de Tiempos y Holguras */}
        <section>
          <PertCalculationsTable result={result} />
        </section>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>Anterior: Red AOA y Datos (Paso 2)</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
        >
          <span>Siguiente: Resumen Ejecutivo (Paso 4)</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
