import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProjectForm } from './ProjectForm'

function renderForm(overrides = {}) {
  const props = {
    activities: [
      {
        key: 'k1',
        id: 'A',
        name: 'Inicio',
        predecessors: [],
        a: '1',
        m: '2',
        b: '3',
      },
    ],
    targetTime: '13',
    onTargetTimeChange: vi.fn(),
    onUpdateActivity: vi.fn(),
    onAddActivity: vi.fn(),
    onRemoveActivity: vi.fn(),
    onSolve: vi.fn(),
    onClear: vi.fn(),
    loading: false,
    fieldErrors: { general: [], byKey: {} },
    ...overrides,
  }

  render(<ProjectForm {...props} />)
  return props
}

describe('ProjectForm', () => {
  it('updates an activity identifier', () => {
    const props = renderForm()
    fireEvent.change(screen.getByPlaceholderText('A'), {
      target: { value: 'B' },
    })

    expect(props.onUpdateActivity).toHaveBeenCalledWith('k1', { id: 'B' })
  })

  it('adds and removes activities', () => {
    const props = renderForm({
      activities: [
        {
          key: 'k1',
          id: 'A',
          name: 'Inicio',
          predecessors: [],
          a: '1',
          m: '2',
          b: '3',
        },
        {
          key: 'k2',
          id: 'B',
          name: 'Fin',
          predecessors: ['A'],
          a: '2',
          m: '3',
          b: '4',
        },
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: /agregar actividad/i }))
    expect(props.onAddActivity).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /eliminar actividad b/i }))
    expect(props.onRemoveActivity).toHaveBeenCalledWith('k2')
  })

  it('submits the form and shows general errors', () => {
    const props = renderForm({
      fieldErrors: {
        general: ['Agrega al menos una actividad al proyecto.'],
        byKey: {},
      },
    })

    expect(
      screen.getByText('Agrega al menos una actividad al proyecto.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /resolver/i }))
    expect(props.onSolve).toHaveBeenCalledTimes(1)
  })
})
