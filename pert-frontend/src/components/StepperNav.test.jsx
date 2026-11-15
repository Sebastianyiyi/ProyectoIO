import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepperNav } from './StepperNav'

describe('StepperNav', () => {
  it('renders all 4 steps and handles clicks', () => {
    const onStepClick = vi.fn()
    render(
      <StepperNav
        activeStep={1}
        onStepClick={onStepClick}
        resultsAvailable={true}
      />,
    )

    expect(screen.getByText('Configuración')).toBeInTheDocument()
    expect(screen.getByText('Datos y Red AOA')).toBeInTheDocument()
    expect(screen.getByText('Red y Cálculos')).toBeInTheDocument()
    expect(screen.getByText('Resultados')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Datos y Red AOA'))
    expect(onStepClick).toHaveBeenCalledWith(2, 'paso-2')
  })
})
