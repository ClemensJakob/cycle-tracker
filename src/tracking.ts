/**
 * Tracking Domain Logic
 *
 * This module contains the core domain logic for tracking daily data.
 * It follows the Crockford object pattern for immutable domain entities.
 */

export type TrackingEntry = {
  dateKey: string // Format: YYYY-MM-DD
  mood?: number // 1-5
  libido?: number // 1-5
  notes?: string
}

export type TrackingEntryObject = {
  getDateKey: () => string
  getMood: () => number | undefined
  getLibido: () => number | undefined
  getNotes: () => string | undefined
  setMood: (value: number | undefined) => TrackingEntryObject
  setLibido: (value: number | undefined) => TrackingEntryObject
  setNotes: (value: string | undefined) => TrackingEntryObject
  toJSON: () => TrackingEntry
}

/**
 * Clamp a value to a range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Creates a TrackingEntry object using the Crockford pattern
 */
export function makeTrackingEntry(
  dateKey: string,
  mood?: number,
  libido?: number,
  notes?: string
): TrackingEntryObject {
  const state: TrackingEntry = {
    dateKey,
    mood,
    libido,
    notes,
  }

  return {
    getDateKey: () => state.dateKey,
    getMood: () => state.mood,
    getLibido: () => state.libido,
    getNotes: () => state.notes,

    setMood: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return makeTrackingEntry(state.dateKey, clampedValue, state.libido, state.notes)
    },

    setLibido: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return makeTrackingEntry(state.dateKey, state.mood, clampedValue, state.notes)
    },

    setNotes: (value: string | undefined) => {
      return makeTrackingEntry(state.dateKey, state.mood, state.libido, value)
    },

    toJSON: () => ({
      dateKey: state.dateKey,
      mood: state.mood,
      libido: state.libido,
      notes: state.notes,
    }),
  }
}

/**
 * Format a date as YYYY-MM-DD for use as a storage key
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get the display label for a date (day name and day of month)
 */
export function getDayLabel(date: Date): { dayName: string; dayOfMonth: number } {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return {
    dayName: dayNames[date.getDay()],
    dayOfMonth: date.getDate(),
  }
}

/**
 * Get a date for a specific number of days ago from today
 */
export function getDateDaysAgo(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

/**
 * Parse a date key back into a Date object
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}
