import { BarChart3, SlidersHorizontal } from 'lucide-react'

const TAB_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2'

function TabButton({
  active,
  controls,
  disabled = false,
  icon: Icon,
  children,
  onClick,
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`${controls}-tab`}
      aria-controls={controls}
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`${TAB_BASE} ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </button>
  )
}

export function SidebarTabs({
  activeTab,
  onChange,
  resultsAvailable,
  configuration,
  results,
}) {
  return (
    <div>
      <div
        role="tablist"
        aria-label="Panel del proyecto"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        <TabButton
          active={activeTab === 'configuration'}
          controls="sidebar-configuration"
          icon={SlidersHorizontal}
          onClick={() => onChange('configuration')}
        >
          Configuración
        </TabButton>
        <TabButton
          active={activeTab === 'results'}
          controls="sidebar-results"
          icon={BarChart3}
          disabled={!resultsAvailable}
          onClick={() => onChange('results')}
        >
          Resultados & Tablas
        </TabButton>
      </div>

      {activeTab === 'configuration' ? (
        <div
          role="tabpanel"
          id="sidebar-configuration"
          aria-labelledby="sidebar-configuration-tab"
          className="mt-3 space-y-4"
        >
          {configuration}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="sidebar-results"
          aria-labelledby="sidebar-results-tab"
          className="mt-3 space-y-4"
        >
          {results}
        </div>
      )}
    </div>
  )
}
