import { Check } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const INPUT_BASE =
  'h-9 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 shadow-none outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400'

const MENU_GAP = 6
const MENU_MARGIN = 12
const MENU_WIDTH = 248
const MENU_MAX_HEIGHT = 264

export function CpmPredecessorPicker({
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

