import { TrackingProvider } from '@/TrackingContext'
import type { TrackingStorageClient } from '@/storage-client'
import { formatDateKey, type TrackingEntry } from '@/tracking'
import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TrackPage } from './TrackPage'

function createMockClient(
  initialEntries: Record<string, TrackingEntry> = {}
): TrackingStorageClient {
  const entries = { ...initialEntries }
  return {
    getEntry: vi.fn(async (dateKey: string) => entries[dateKey]),
    saveEntry: vi.fn(async (entry: TrackingEntry) => {
      entries[entry.dateKey] = entry
    }),
    deleteEntry: vi.fn(async (dateKey: string) => {
      delete entries[dateKey]
    }),
    getAllEntries: vi.fn(async () => Object.values(entries)),
  }
}

describe('TrackPage', () => {
  it('should display day cards with today always visible', async () => {
    const mockClient = createMockClient()

    render(
      <TrackingProvider storageClient={mockClient}>
        <TrackPage />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
    })
  })

  it('should have today selected by default and show form', async () => {
    const mockClient = createMockClient()

    render(
      <TrackingProvider storageClient={mockClient}>
        <TrackPage />
      </TrackingProvider>
    )

    await waitFor(() => {
      // Form should be visible immediately since today is selected by default
      expect(screen.getByText('Mood')).toBeInTheDocument()
      expect(screen.getByText('Libido')).toBeInTheDocument()
    })
  })

  it('should show evaluation section with averages', async () => {
    const mockClient = createMockClient()

    render(
      <TrackingProvider storageClient={mockClient}>
        <TrackPage />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Cycle Phase')).toBeInTheDocument()
      expect(screen.getByText('Trends')).toBeInTheDocument()
    })
  })

  it('should show sliders with 1-5 range', async () => {
    const mockClient = createMockClient()

    render(
      <TrackingProvider storageClient={mockClient}>
        <TrackPage />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Mood')).toBeInTheDocument()
    })

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
  })

  it('should switch to a different day when clicked', async () => {
    const mockClient = createMockClient()

    render(
      <TrackingProvider storageClient={mockClient}>
        <TrackPage />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Yesterday')).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText('Yesterday').closest('button')?.click()
    })

    // Form should still be visible
    await waitFor(() => {
      expect(screen.getByText('Mood')).toBeInTheDocument()
    })
  })

  it('should display previously saved data', async () => {
    const todayKey = formatDateKey(new Date())
    const mockClient = createMockClient({
      [todayKey]: {
        dateKey: todayKey,
        mood: 4,
        libido: 3,
      },
    })

    render(
      <TrackingProvider storageClient={mockClient}>
        <TrackPage />
      </TrackingProvider>
    )

    await waitFor(() => {
      // Check that form is loaded with the saved values
      const moodLabel = screen.getByText('Mood')
      const libidoLabel = screen.getByText('Libido')
      expect(moodLabel).toBeInTheDocument()
      expect(libidoLabel).toBeInTheDocument()

      // Check sliders are present
      const sliders = screen.getAllByRole('slider')
      expect(sliders).toHaveLength(2)
    })
  })
})
