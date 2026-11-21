import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import PertApp from '../App.jsx'
import './methodTabs.css'

const CpmWorkspace = lazy(() => import('./CpmWorkspace').then((module) => ({ default: module.CpmWorkspace })))

export function MethodTabsApp() {
  const [method, setMethod] = useState('pert')
  const [cpmVisited, setCpmVisited] = useState(false)
  const originalTitle = useRef(document.title)
  const buttons = useRef({})

  useEffect(() => {
    document.title = method === 'cpm' ? 'CPM Lab | Investigación de Operaciones' : originalTitle.current
  }, [method])

  function select(value) {
    if (value === 'cpm') setCpmVisited(true)
    setMethod(value)
  }

  function handleKeys(event, value) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'pert' : event.key === 'End' ? 'cpm' : value === 'pert' ? 'cpm' : 'pert'
    select(next)
    buttons.current[next]?.focus()
  }

  return (
    <div className="method-tabs-app">
      <div className="method-tabs-bar">
        <span className="method-tabs-caption">Método de resolución</span>
        <div role="tablist" aria-label="Métodos de investigación de operaciones" className="method-tabs-list">
          {['pert', 'cpm'].map((value) => (
            <button key={value} ref={(element) => { buttons.current[value] = element }} id={`method-tab-${value}`} role="tab" type="button" aria-selected={method === value} aria-controls={`method-panel-${value}`} tabIndex={method === value ? 0 : -1} onClick={() => select(value)} onKeyDown={(event) => handleKeys(event, value)}>{value.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <section id="method-panel-pert" role="tabpanel" aria-labelledby="method-tab-pert" hidden={method !== 'pert'} className="method-tab-panel">
        <PertApp />
      </section>
      <section id="method-panel-cpm" role="tabpanel" aria-labelledby="method-tab-cpm" hidden={method !== 'cpm'} className="method-tab-panel">
        {cpmVisited && <Suspense fallback={<p className="p-6 text-sm text-slate-500">Abriendo CPM…</p>}><CpmWorkspace active={method === 'cpm'} /></Suspense>}
      </section>
    </div>
  )
}
