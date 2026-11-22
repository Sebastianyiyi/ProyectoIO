import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MethodTabsApp } from '../MethodTabsApp'
import * as cpmApi from '../api/cpmApi'
import * as pertApi from '../../api/pertApi'
import fixtures from './fixtures/projects.json'

vi.mock('../api/cpmApi', () => ({ getCpmExample: vi.fn(), solveCpm: vi.fn() }))
vi.mock('../../api/pertApi', () => ({ getHealth: vi.fn(), getExample: vi.fn(), solvePert: vi.fn() }))
vi.mock('../../components/GraphCanvas', () => ({ GraphCanvas: () => <div aria-label="Lienzo original PERT" /> }))
vi.mock('../components/CpmGraph', () => ({ CpmGraph: ({ topRight, headerActions }) => <div aria-label="Lienzo CPM">{headerActions}{topRight}</div> }))

beforeEach(() => {
  vi.clearAllMocks()
  pertApi.getHealth.mockResolvedValue({ status: 'ok' })
  pertApi.getExample.mockResolvedValue(fixtures.pert.request)
  pertApi.solvePert.mockResolvedValue(fixtures.pert.result)
  cpmApi.getCpmExample.mockResolvedValue(fixtures.cpm.request)
  cpmApi.solveCpm.mockResolvedValue(fixtures.cpm.result)
})

async function openCpm() {
  render(<MethodTabsApp />)
  await waitFor(() => expect(pertApi.solvePert).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByRole('tab', { name: 'CPM', exact: true }))
  await screen.findByLabelText('Duración CPM A', {}, { timeout: 5000 })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Calcular CPM y continuar' })).toBeEnabled())
  return within(screen.getByRole('tabpanel', { name: 'CPM', exact: true }))
}

describe('Separate PERT and CPM workspaces', () => {
  it('starts with the original PERT workspace and loads CPM only when its tab is opened', async () => {
    render(<MethodTabsApp />)
    await waitFor(() => expect(pertApi.solvePert).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('tab', { name: 'PERT' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'PERT' })).toBeVisible()
    expect(screen.queryByRole('tabpanel', { name: 'CPM' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Tiempo objetivo T:')).toHaveValue('13')
    expect(cpmApi.getCpmExample).not.toHaveBeenCalled()
  })

  it('shows CPM fields in its own tab with one example button and no example selector', async () => {
    const cpm = await openCpm()
    expect(screen.queryByRole('tabpanel', { name: 'PERT' })).not.toBeInTheDocument()
    expect(cpm.getByRole('columnheader', { name: 'Duración (días)' })).toBeVisible()
    expect(cpm.queryByRole('combobox')).not.toBeInTheDocument()
    expect(cpm.getAllByRole('button', { name: 'Cargar ejemplo CPM' })).toHaveLength(1)
    expect(cpm.queryByLabelText('Tiempo objetivo T:')).not.toBeInTheDocument()
    expect(cpm.queryByRole('columnheader', { name: 'a', exact: true })).not.toBeInTheDocument()
    expect(cpmApi.getCpmExample.mock.calls[0]).toHaveLength(0)
  })

  it('keeps the PERT and CPM drafts and results independent', async () => {
    const cpm = await openCpm()
    fireEvent.change(cpm.getByLabelText('Duración CPM A'), { target: { value: '6,5' } })
    fireEvent.click(screen.getByRole('tab', { name: 'PERT', exact: true }))
    expect(screen.getByLabelText('Tiempo objetivo T:')).toHaveValue('13')
    fireEvent.change(screen.getByLabelText('Tiempo objetivo T:'), { target: { value: '15' } })
    fireEvent.click(screen.getByRole('tab', { name: 'CPM', exact: true }))
    expect(screen.getByLabelText('Duración CPM A')).toHaveValue('6,5')
    fireEvent.click(screen.getByRole('tab', { name: 'PERT', exact: true }))
    expect(screen.getByLabelText('Tiempo objetivo T:')).toHaveValue('15')
    expect(pertApi.getExample).toHaveBeenCalledTimes(1)
    expect(pertApi.solvePert).toHaveBeenCalledTimes(1)
    expect(cpmApi.getCpmExample).toHaveBeenCalledTimes(1)
  })

  it('calculates CPM and navigates through the animation, tables and its own summary', async () => {
    const cpm = await openCpm()
    fireEvent.click(cpm.getByRole('button', { name: 'Calcular CPM y continuar' }))
    await cpm.findByLabelText('Lienzo CPM')
    expect(cpmApi.solveCpm).toHaveBeenLastCalledWith(fixtures.cpm.request)
    fireEvent.click(cpm.getByRole('button', { name: 'Paso siguiente', exact: true }))
    expect(cpm.getByLabelText('Explicación del paso CPM')).toHaveTextContent('Paso 2 de')
    fireEvent.click(cpm.getByRole('button', { name: 'Paso anterior', exact: true }))
    expect(cpm.getByLabelText('Explicación del paso CPM')).toHaveTextContent('Paso 1 de')
    fireEvent.click(cpm.getByRole('button', { name: 'Ir al resultado final', exact: true }))
    expect(cpm.getByLabelText('Explicación del paso CPM')).toHaveTextContent('A -> B -> D')
    fireEvent.click(cpm.getByRole('button', { name: /Tiempos y holguras CPM/ }))
    const resultsRegion = cpm.getByLabelText('Tiempos y holguras CPM')
    expect(within(resultsRegion).getByRole('table', { name: 'Actividades y holguras CPM' })).toHaveTextContent('f1')
    expect(within(resultsRegion).getByText('12,0 días')).toBeVisible()
    fireEvent.click(cpm.getByRole('button', { name: /Resumen CPM/ }))
    const summaryRegion = cpm.getByLabelText('Resumen CPM')
    expect(within(summaryRegion).getByLabelText('Ruta crítica CPM 1')).toHaveTextContent('A→B→D')
    expect(within(summaryRegion).getByText('12,0 días')).toBeVisible()
  })

  it('validates a negative CPM duration without calling its API', async () => {
    const cpm = await openCpm()
    const count = cpmApi.solveCpm.mock.calls.length
    fireEvent.change(cpm.getByLabelText('Duración CPM A'), { target: { value: '-2' } })
    fireEvent.click(cpm.getByRole('button', { name: 'Calcular CPM y continuar' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('mayor o igual a 0')
    expect(cpmApi.solveCpm).toHaveBeenCalledTimes(count)
  })

  it('supports keyboard navigation between the two method tabs', async () => {
    await openCpm()
    fireEvent.keyDown(screen.getByRole('tab', { name: 'CPM' }), { key: 'Home' })
    expect(screen.getByRole('tab', { name: 'PERT' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(screen.getByRole('tab', { name: 'PERT' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: 'CPM' })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps a custom CPM draft after an API error so it can be submitted again', async () => {
    const cpm = await openCpm()
    fireEvent.change(cpm.getByLabelText('Duración CPM A'), { target: { value: '6,5' } })
    cpmApi.solveCpm.mockRejectedValueOnce(new Error('El backend no responde.'))
    fireEvent.click(cpm.getByRole('button', { name: 'Calcular CPM y continuar' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('El backend no responde.')
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }))
    expect(cpm.getByLabelText('Duración CPM A')).toHaveValue('6,5')
    fireEvent.click(cpm.getByRole('button', { name: 'Calcular CPM y continuar' }))
    await cpm.findByLabelText('Lienzo CPM')
    expect(cpmApi.solveCpm).toHaveBeenLastCalledWith(expect.objectContaining({ activities: expect.arrayContaining([expect.objectContaining({ id: 'A', duration: 6.5 })]) }))
    expect(cpmApi.getCpmExample).toHaveBeenCalledTimes(1)
  })
})
