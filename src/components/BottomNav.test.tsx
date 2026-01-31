import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('should render track and evaluate navigation items', () => {
    render(<BottomNav activePage="track" onNavigate={() => {}} />)

    expect(screen.getByText('Track')).toBeInTheDocument()
    expect(screen.getByText('Evaluate')).toBeInTheDocument()
  })

  it('should highlight the active page', () => {
    render(<BottomNav activePage="track" onNavigate={() => {}} />)

    const trackButton = screen.getByText('Track').closest('button')
    expect(trackButton).toHaveClass('text-primary')
  })

  it('should call onNavigate when a nav item is clicked', () => {
    const onNavigate = vi.fn()
    render(<BottomNav activePage="track" onNavigate={onNavigate} />)

    fireEvent.click(screen.getByText('Evaluate'))

    expect(onNavigate).toHaveBeenCalledWith('evaluate')
  })
})
