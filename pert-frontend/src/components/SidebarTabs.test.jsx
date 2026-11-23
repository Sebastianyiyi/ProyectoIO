import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SidebarTabs } from './SidebarTabs'

function renderTabs(overrides = {}) {
  const props = {
    activeTab: 'configuration',
    onChange: vi.fn(),
    resultsAvailable: false,
    configuration: <p>Formulario PERT</p>,
    results: <p>Resultados PERT</p>,
    ...overrides,
  }

  render(<SidebarTabs {...props} />)
  return props
}

describe('SidebarTabs', () => {
  it('shows the configuration panel and disables results before solving', () => {
    renderTabs()

    expect(screen.getByText('Formulario PERT')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /resultados & tablas/i }),
    ).toBeDisabled()
  })

  it('notifies tab changes and shows the results panel when active', () => {
    const props = renderTabs({ resultsAvailable: true })

    fireEvent.click(screen.getByRole('tab', { name: /resultados & tablas/i }))
    expect(props.onChange).toHaveBeenCalledWith('results')

    render(
      <SidebarTabs
        activeTab="results"
        onChange={props.onChange}
        resultsAvailable
        configuration={<p>Formulario PERT</p>}
        results={<p>Resultados PERT</p>}
      />,
    )

    expect(screen.getByText('Resultados PERT')).toBeInTheDocument()
  })
})
