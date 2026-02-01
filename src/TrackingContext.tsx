import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { storageClient, type TrackingStorageClient } from './storage-client'
import { makeTrackingEntry, type TrackingEntry, type TrackingEntryObject } from './tracking'
import { TrackingContext, type TrackingContextValue } from './useTracking'

type TrackingProviderProps = {
  children: ReactNode
  storageClient?: TrackingStorageClient
}

export function TrackingProvider({
  children,
  storageClient: client = storageClient,
}: TrackingProviderProps) {
  const [entries, setEntries] = useState<Record<string, TrackingEntryObject>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load entries from storage on mount
  useEffect(() => {
    async function loadEntries() {
      try {
        const storedEntries = await client.getAllEntries()
        const entriesMap: Record<string, TrackingEntryObject> = {}

        for (const entry of storedEntries) {
          entriesMap[entry.dateKey] = makeTrackingEntry(
            entry.dateKey,
            entry.mood,
            entry.libido,
            entry.notes
          )
        }

        setEntries(entriesMap)
      } finally {
        setIsLoading(false)
      }
    }

    loadEntries()
  }, [client])

  const getEntry = useCallback(
    (dateKey: string): TrackingEntryObject => {
      return entries[dateKey] ?? makeTrackingEntry(dateKey)
    },
    [entries]
  )

  const updateEntry = useCallback(
    (entry: TrackingEntryObject) => {
      const dateKey = entry.getDateKey()
      const entryData: TrackingEntry = entry.toJSON()

      // Update local state immediately
      setEntries((prev) => ({
        ...prev,
        [dateKey]: entry,
      }))

      // Persist to storage
      client.saveEntry(entryData)
    },
    [client]
  )

  const value: TrackingContextValue = {
    entries,
    getEntry,
    updateEntry,
    isLoading,
  }

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}
