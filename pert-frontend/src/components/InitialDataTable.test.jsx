import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InitialDataTable } from './InitialDataTable'

describe('InitialDataTable', () => {
  it('renders activity IDs and predecessor chips', () => {
    const activities = [
      {
        key: '1',
        id: 'A',
        name: 'Actividad A',
        predecessors: [],
        a: '2',
        m: '4',
        b: '6',
      },
      {
        key: '2',
        id: 'B',
        name: 'Actividad B',
        predecessors: ['A'],
        a: '3',
        m: '5',
        b: '7',
      },
    ]

    render(<InitialDataTable activities={activities} />)

    expect(screen.getByText('— Inicio')).toBeInTheDocument()
    expect(screen.getAllByText('A')).toHaveLength(2)
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
