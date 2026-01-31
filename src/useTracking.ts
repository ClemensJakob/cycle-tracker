import { createContext, useContext } from 'react'
import type { TrackingEntryObject } from './tracking'

export type TrackingContextValue = {
  entries: Record<string, TrackingEntryObject>
  getEntry: (dateKey: string) => TrackingEntryObject
  updateEntry: (entry: TrackingEntryObject) => void
  isLoading: boolean
}

export const TrackingContext = createContext<TrackingContextValue | null>(null)

export function useTracking(): TrackingContextValue {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }
  return context
}
