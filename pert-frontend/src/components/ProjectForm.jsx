import { Calculator, Check, Eraser, Loader2, Plus, Trash2 } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const INPUT_BASE =
  'h-9 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 shadow-none outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400'

const MENU_GAP = 6
const MENU_MARGIN = 12
const MENU_WIDTH = 248
const MENU_MAX_HEIGHT = 264

function CompactPredecessorCell({
  activity,
  activities,
  onChange,
  disabled,
}) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const isOpen = open && !disabled

  const options = activities.filter(
    (a) => a.key !== activity.key && String(a.id ?? '').trim() !== '',
  )
  const selectedSet = new Set((activity.predecessors ?? []).map(String))

  const toggle = (id) => {
    const next = new Set(selectedSet)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onChange(Array.from(next))
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const updatePosition = () => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger || !menu) {
        return
      }

      const rect = trigger.getBoundingClientRect()
      const width = Math.min(MENU_WIDTH, window.innerWidth - MENU_MARGIN * 2)
      const maxHeight = Math.min(
        MENU_MAX_HEIGHT,
        window.innerHeight - MENU_MARGIN * 2,
      )
      const menuHeight = Math.min(menu.offsetHeight, maxHeight)
      const spaceBelow =
        window.innerHeight - rect.bottom - MENU_GAP - MENU_MARGIN
      const spaceAbove = rect.top - MENU_GAP - MENU_MARGIN
      const opensBelow =
        spaceBelow >= menuHeight || spaceBelow >= spaceAbove
      const left = Math.min(
        Math.max(rect.left, MENU_MARGIN),
        window.innerWidth - width - MENU_MARGIN,
      )

      setMenuPosition({
        left,
        top: opensBelow
          ? rect.bottom + MENU_GAP
          : Math.max(MENU_MARGIN, rect.top - MENU_GAP - menuHeight),
        width,
        maxHeight,
        placement: opensBelow ? 'below' : 'above',
      })
    }

    updatePosition()
    const frame = window.requestAnimationFrame(updatePosition)

    const handlePointerDown = (event) => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (
        trigger?.contains(event.target) ||
        menu?.contains(event.target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    const handleScroll = (event) => {
      if (menuRef.current?.contains(event.target)) {
        return
      }
      updatePosition()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, options.length])

  const count = activity.predecessors?.length ?? 0

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Predecesores"
          aria-multiselectable="true"
          style={{
            position: 'fixed',
            left: menuPosition?.left ?? -9999,
            top: menuPosition?.top ?? -9999,
            width: menuPosition?.width ?? MENU_WIDTH,
            maxHeight: menuPosition?.maxHeight ?? MENU_MAX_HEIGHT,
            visibility: menuPosition ? 'visible' : 'hidden',
          }}
          className="z-[120] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5"
        >
          <div className="mb-1 flex items-center justify-between gap-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Predecesores
            </p>
            <span className="text-[10px] font-semibold text-slate-400">
              {count} seleccionado{count === 1 ? '' : 's'}
            </span>
          </div>
          {options.length === 0 ? (
            <p className="px-1 py-1 text-[11px] italic text-slate-400">
              Define otras actividades con ID
            </p>
          ) : (
            <div className="grid gap-1">
              {options.map((opt) => {
                const checked = selectedSet.has(opt.id)
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(opt.id)}
                    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition ${
                      checked
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{opt.id}</span>
                    {checked ? (
                      <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
        </div>,
        document.body,
      )
    : null

  return (
    <div ref={triggerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`${INPUT_BASE} flex w-full min-w-[70px] items-center justify-between px-2 text-left font-semibold`}
        title="Seleccionar predecesores"
      >
        <span className="truncate">
          {count > 0 ? (
            <span className="font-bold text-indigo-700">
              {activity.predecessors.join(', ')}
            </span>
          ) : (
            <span className="font-normal text-slate-400">—</span>
          )}
        </span>
        <span
          className={`ml-1 text-[9px] text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>
      {menu}
    </div>
  )
}

export function ProjectForm({
  activities,
  targetTime,
  onTargetTimeChange,
  onUpdateActivity,
  onAddActivity,
  onRemoveActivity,
  onSolve,
  onClear,
  loading,
  fieldErrors,
}) {
  const disabled = loading

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSolve()
      }}
      className="flex flex-col h-full space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Tabla de Actividades
          </h2>
          <p className="text-[11px] text-slate-400">
            Ingresa ID, nombre y estimaciones PERT (a, m, b).
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>

      {/* Tabla editable compacta con max-height: 450px y scroll propio */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          <table className="w-full min-w-[390px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-1.5 py-2 text-center w-12">
                  ID
                </th>
                <th scope="col" className="px-1.5 py-2">
                  Nombre
                </th>
                <th scope="col" className="px-1.5 py-2 w-20">
                  Pred.
                </th>
                <th scope="col" className="px-1 py-2 text-center w-12" title="Tiempo optimista">
                  a
                </th>
                <th scope="col" className="px-1 py-2 text-center w-12" title="Tiempo más probable">
                  m
                </th>
                <th scope="col" className="px-1 py-2 text-center w-12" title="Tiempo pesimista">
                  b
                </th>
                <th scope="col" className="px-1 py-2 text-center w-9">
                  <span className="sr-only">Eliminar</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((activity, index) => {
                const rowErrors = fieldErrors?.byKey?.[activity.key] ?? {}
                const hasError = Boolean(
                  rowErrors.id || rowErrors.a || rowErrors.m || rowErrors.b || rowErrors.time,
                )

                return (
                  <tr
                    key={activity.key}
                    className={`transition-colors ${
                      hasError ? 'bg-rose-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* ID */}
                    <td className="px-1 py-1.5 text-center">
                      <input
                        value={activity.id}
                        onChange={(e) =>
                          onUpdateActivity(activity.key, { id: e.target.value })
                        }
                        disabled={disabled}
                        placeholder={index === 0 ? 'A' : ''}
                        maxLength={40}
                        className={`${INPUT_BASE} w-11 px-1 text-center font-bold uppercase ${
                          rowErrors.id ? 'border-rose-400 bg-rose-50 text-rose-800' : ''
                        }`}
                      />
                    </td>

                    {/* Nombre */}
                    <td className="px-1 py-1.5">
                      <input
                        value={activity.name}
                        onChange={(e) =>
                          onUpdateActivity(activity.key, { name: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="Nombre de actividad"
                        maxLength={120}
                        className={`${INPUT_BASE} w-full min-w-[90px] px-2 font-medium`}
                      />
                    </td>

                    {/* Predecesores */}
                    <td className="px-1 py-1.5">
                      <CompactPredecessorCell
                        activity={activity}
                        activities={activities}
                        onChange={(predecessors) =>
                          onUpdateActivity(activity.key, { predecessors })
                        }
                        disabled={disabled}
                      />
                    </td>

                    {/* a */}
                    <td className="px-1 py-1.5">
                      <input
                        value={activity.a}
                        onChange={(e) =>
                          onUpdateActivity(activity.key, { a: e.target.value })
                        }
                        disabled={disabled}
                        inputMode="decimal"
                        placeholder="0"
                        className={`${INPUT_BASE} w-11 px-1 text-center font-mono ${
                          rowErrors.a || rowErrors.time
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : ''
                        }`}
                      />
                    </td>

                    {/* m */}
                    <td className="px-1 py-1.5">
                      <input
                        value={activity.m}
                        onChange={(e) =>
                          onUpdateActivity(activity.key, { m: e.target.value })
                        }
                        disabled={disabled}
                        inputMode="decimal"
                        placeholder="0"
                        className={`${INPUT_BASE} w-11 px-1 text-center font-mono ${
                          rowErrors.m || rowErrors.time
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : ''
                        }`}
                      />
                    </td>

                    {/* b */}
                    <td className="px-1 py-1.5">
                      <input
                        value={activity.b}
                        onChange={(e) =>
                          onUpdateActivity(activity.key, { b: e.target.value })
                        }
                        disabled={disabled}
                        inputMode="decimal"
                        placeholder="0"
                        className={`${INPUT_BASE} w-11 px-1 text-center font-mono ${
                          rowErrors.b || rowErrors.time
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : ''
                        }`}
                      />
                    </td>

                    {/* Eliminar */}
                    <td className="px-1 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveActivity(activity.key)}
                        disabled={activities.length <= 1 || disabled}
                        aria-label={`Eliminar actividad ${activity.id || index + 1}`}
                        title={
                          activities.length <= 1
                            ? 'Mínimo una actividad requerida'
                            : 'Eliminar actividad'
                        }
                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={onAddActivity}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-slate-200 bg-slate-50/70 py-2 text-xs font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Agregar actividad
        </button>
      </div>

      {/* Tiempo objetivo T */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <label
          htmlFor="target-time"
          className="text-xs font-bold text-slate-600 whitespace-nowrap"
        >
          Tiempo objetivo T:
        </label>
        <input
          id="target-time"
          value={targetTime}
          onChange={(event) => onTargetTimeChange(event.target.value)}
          disabled={disabled}
          inputMode="decimal"
          placeholder="Ej. 13"
          className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-xs font-mono font-semibold text-slate-900 shadow-none outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
        />
        <span className="text-[11px] text-slate-400 italic">
          (Para calcular Z y P)
        </span>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Calculator className="size-3.5" aria-hidden="true" />
          )}
          Ir al siguiente paso
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Eraser className="size-3.5" aria-hidden="true" />
          Limpiar
        </button>
      </div>
    </form>
  )
}
