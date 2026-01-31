import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeLocalStorageClient, type TrackingStorageClient } from './storage-client'
import type { TrackingEntry } from './tracking'

describe('storage-client', () => {
  let mockStorage: { [key: string]: string }

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

  describe('makeLocalStorageClient', () => {
    let client: TrackingStorageClient

    beforeEach(() => {
      client = makeLocalStorageClient()
    })

    it('should return undefined for non-existent entry', async () => {
      const entry = await client.getEntry('2026-01-31')
      expect(entry).toBeUndefined()
    })

    it('should save and retrieve an entry', async () => {
      const entry: TrackingEntry = {
        dateKey: '2026-01-31',
        mood: 7,
        libido: 5,
      }

      await client.saveEntry(entry)
      const retrieved = await client.getEntry('2026-01-31')

      expect(retrieved).toEqual(entry)
    })

    it('should retrieve all entries', async () => {
      const entry1: TrackingEntry = {
        dateKey: '2026-01-30',
        mood: 6,
        libido: 4,
      }
      const entry2: TrackingEntry = {
        dateKey: '2026-01-31',
        mood: 7,
        libido: 5,
      }

      await client.saveEntry(entry1)
      await client.saveEntry(entry2)

      const allEntries = await client.getAllEntries()

      expect(allEntries).toHaveLength(2)
      expect(allEntries).toContainEqual(entry1)
      expect(allEntries).toContainEqual(entry2)
    })

    it('should delete an entry', async () => {
      const entry: TrackingEntry = {
        dateKey: '2026-01-31',
        mood: 7,
        libido: 5,
      }

      await client.saveEntry(entry)
      await client.deleteEntry('2026-01-31')

      const retrieved = await client.getEntry('2026-01-31')
      expect(retrieved).toBeUndefined()
    })

    it('should update an existing entry', async () => {
      const entry: TrackingEntry = {
        dateKey: '2026-01-31',
        mood: 7,
        libido: 5,
      }

      await client.saveEntry(entry)

      const updated: TrackingEntry = {
        dateKey: '2026-01-31',
        mood: 8,
        libido: 6,
      }

      await client.saveEntry(updated)

      const retrieved = await client.getEntry('2026-01-31')
      expect(retrieved).toEqual(updated)
    })
  })
})
