import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

// Mock localStorage
let mockStorage: { [key: string]: string } = {}

beforeEach(() => {
  mockStorage = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key]
    }),
  })
})

describe('App', () => {
  it('renders the Track page with today selected by default', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
    })
  })

  it('shows the chart section', async () => {
    render(<App />)

    await waitFor(() => {
      // Check for chart section header
      expect(screen.getByText('Last 10 days')).toBeInTheDocument()
    })
  })

  it('shows the tracking form for today', async () => {
    render(<App />)

    await waitFor(() => {
      // Form labels are in German
      expect(screen.getByText('Stimmung')).toBeInTheDocument()
      expect(screen.getByText('Libido')).toBeInTheDocument()
    })
  })
})
