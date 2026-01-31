import { TrackingProvider } from '@/TrackingContext'
import type { TrackingStorageClient } from '@/storage-client'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EvaluatePage } from './EvaluatePage'

function createMockClient(): TrackingStorageClient {
  return {
    getEntry: vi.fn(async () => undefined),
    saveEntry: vi.fn(async () => {}),
    deleteEntry: vi.fn(async () => {}),
    getAllEntries: vi.fn(async () => []),
  }
}

describe('EvaluatePage', () => {
  it('should render the evaluate page', async () => {
    const mockClient = createMockClient()

    render(
      <TrackingProvider storageClient={mockClient}>
        <EvaluatePage />
      </TrackingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Evaluate')).toBeInTheDocument()
    })
  })
})
