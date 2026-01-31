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

  it('shows the evaluation section with averages', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Avg Mood')).toBeInTheDocument()
      expect(screen.getByText('Avg Libido')).toBeInTheDocument()
    })
  })

  it('shows the tracking form for today', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Mood')).toBeInTheDocument()
      expect(screen.getByText('Libido')).toBeInTheDocument()
    })
  })
})
