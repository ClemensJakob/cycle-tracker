/**
 * Storage Client Abstraction
 *
 * This module provides an abstraction layer for persisting tracking data.
 * Currently implements localStorage, but can be swapped for server/database storage.
 */

import type { TrackingEntry } from './tracking'

const STORAGE_KEY = 'cycle-tracker-entries'

export type TrackingStorageClient = {
  getEntry: (dateKey: string) => Promise<TrackingEntry | undefined>
  saveEntry: (entry: TrackingEntry) => Promise<void>
  deleteEntry: (dateKey: string) => Promise<void>
  getAllEntries: () => Promise<TrackingEntry[]>
}

type StorageData = {
  entries: Record<string, TrackingEntry>
}

function getStorageData(): StorageData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { entries: {} }
  }
  try {
    return JSON.parse(raw) as StorageData
  } catch {
    return { entries: {} }
  }
}

function setStorageData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Creates a localStorage-based storage client
 */
export function makeLocalStorageClient(): TrackingStorageClient {
  return {
    async getEntry(dateKey: string): Promise<TrackingEntry | undefined> {
      const data = getStorageData()
      return data.entries[dateKey]
    },

    async saveEntry(entry: TrackingEntry): Promise<void> {
      const data = getStorageData()
      data.entries[entry.dateKey] = entry
      setStorageData(data)
    },

    async deleteEntry(dateKey: string): Promise<void> {
      const data = getStorageData()
      delete data.entries[dateKey]
      setStorageData(data)
    },

    async getAllEntries(): Promise<TrackingEntry[]> {
      const data = getStorageData()
      return Object.values(data.entries)
    },
  }
}

/**
 * Default storage client instance
 */
export const storageClient = makeLocalStorageClient()
