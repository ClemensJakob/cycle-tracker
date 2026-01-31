import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TrackingStorageClient } from './storage-client'
import type { TrackingEntry } from './tracking'
import { TrackingProvider } from './TrackingContext'
import { useTracking } from './useTracking'

function TestComponent() {
  const { entries, getEntry, updateEntry, isLoading } = useTracking()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const entry = getEntry('2026-01-31')

  return (
    <div>
      <div data-testid="entries-count">{Object.keys(entries).length}</div>
      <div data-testid="mood">{entry?.getMood() ?? 'no-mood'}</div>
      <button
        data-testid="set-mood"
        onClick={() => {
          const currentEntry = getEntry('2026-01-31')
          updateEntry(currentEntry.setMood(4))
        }}
      >
        Set Mood
      </button>
    </div>
  )
}

describe('TrackingContext', () => {
  let mockClient: TrackingStorageClient
  let mockEntries: Record<string, TrackingEntry>

  beforeEach(() => {
    mockEntries = {}
    mockClient = {
      getEntry: vi.fn(async (dateKey: string) => mockEntries[dateKey]),
      saveEntry: vi.fn(async (entry: TrackingEntry) => {
        mockEntries[entry.dateKey] = entry
      }),
      deleteEntry: vi.fn(async (dateKey: string) => {
        delete mockEntries[dateKey]
      }),
      getAllEntries: vi.fn(async () => Object.values(mockEntries)),
    }
  })

  it('should provide entries from storage', async () => {
    mockEntries['2026-01-31'] = { dateKey: '2026-01-31', mood: 5, libido: 3 }

    render(
      <TrackingProvider storageClient={mockClient}>
        <TestComponent />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('entries-count')).toHaveTextContent('1')
    expect(screen.getByTestId('mood')).toHaveTextContent('5')
  })

  it('should allow updating entries', async () => {
    render(
      <TrackingProvider storageClient={mockClient}>
        <TestComponent />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    await act(async () => {
      screen.getByTestId('set-mood').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('mood')).toHaveTextContent('4')
    })

    expect(mockClient.saveEntry).toHaveBeenCalledWith({
      dateKey: '2026-01-31',
      mood: 4,
      libido: undefined,
    })
  })

  it('should show loading state initially', () => {
    render(
      <TrackingProvider storageClient={mockClient}>
        <TestComponent />
      </TrackingProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
