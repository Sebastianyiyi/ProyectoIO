import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExecutionModeSwitch } from './ExecutionModeSwitch'

describe('ExecutionModeSwitch', () => {
  it('marks the current mode and emits changes', () => {
    const onChange = vi.fn()
    render(<ExecutionModeSwitch mode="overview" onChange={onChange} />)

    const globalButton = screen.getByRole('button', { name: /global/i })
    const focusButton = screen.getByRole('button', { name: /enfoque/i })

    expect(globalButton).toHaveAttribute('aria-pressed', 'true')
    expect(focusButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(focusButton)
    expect(onChange).toHaveBeenCalledWith('focus')
  })
})
