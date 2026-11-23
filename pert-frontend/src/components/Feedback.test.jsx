import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorModal } from './Feedback'

describe('ErrorModal', () => {
  it('renders validation messages as an accessible alert dialog', () => {
    render(
      <ErrorModal
        open
        title="Revisa los datos del proyecto"
        messages={['El ID es obligatorio.', 'El tiempo debe ser positivo.']}
        onClose={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Revisa los datos del proyecto' }),
    ).toBeInTheDocument()
    expect(screen.getByText('El ID es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El tiempo debe ser positivo.')).toBeInTheDocument()
  })

  it('closes with Escape and can retry the failed operation', () => {
    const onClose = vi.fn()
    const onRetry = vi.fn()

    render(
      <ErrorModal
        open
        messages={['No hay conexión con la API.']}
        onClose={onClose}
        onRetry={onRetry}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('stays closed when there are no messages', () => {
    render(<ErrorModal open messages={[]} onClose={vi.fn()} />)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
