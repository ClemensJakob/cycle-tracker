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
  selfPerception?: number // 1-5
  energy?: number // 1-5
  dischargeConsistency?: number // 1-5 (1=glassy, 5=creamy)
  dischargeAmount?: number // 1-5 (1=little, 5=much)
}

export type TrackingEntryObject = {
  getDateKey: () => string
  getMood: () => number | undefined
  getLibido: () => number | undefined
  getNotes: () => string | undefined
  getSelfPerception: () => number | undefined
  getEnergy: () => number | undefined
  getDischargeConsistency: () => number | undefined
  getDischargeAmount: () => number | undefined
  setMood: (value: number | undefined) => TrackingEntryObject
  setLibido: (value: number | undefined) => TrackingEntryObject
  setNotes: (value: string | undefined) => TrackingEntryObject
  setSelfPerception: (value: number | undefined) => TrackingEntryObject
  setEnergy: (value: number | undefined) => TrackingEntryObject
  setDischargeConsistency: (value: number | undefined) => TrackingEntryObject
  setDischargeAmount: (value: number | undefined) => TrackingEntryObject
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
  notes?: string,
  selfPerception?: number,
  energy?: number,
  dischargeConsistency?: number,
  dischargeAmount?: number
): TrackingEntryObject {
  const state: TrackingEntry = {
    dateKey,
    mood,
    libido,
    notes,
    selfPerception,
    energy,
    dischargeConsistency,
    dischargeAmount,
  }

  const rebuild = (updates: Partial<TrackingEntry>) =>
    makeTrackingEntry(
      'dateKey' in updates ? updates.dateKey! : state.dateKey,
      'mood' in updates ? updates.mood : state.mood,
      'libido' in updates ? updates.libido : state.libido,
      'notes' in updates ? updates.notes : state.notes,
      'selfPerception' in updates ? updates.selfPerception : state.selfPerception,
      'energy' in updates ? updates.energy : state.energy,
      'dischargeConsistency' in updates ? updates.dischargeConsistency : state.dischargeConsistency,
      'dischargeAmount' in updates ? updates.dischargeAmount : state.dischargeAmount
    )

  return {
    getDateKey: () => state.dateKey,
    getMood: () => state.mood,
    getLibido: () => state.libido,
    getNotes: () => state.notes,
    getSelfPerception: () => state.selfPerception,
    getEnergy: () => state.energy,
    getDischargeConsistency: () => state.dischargeConsistency,
    getDischargeAmount: () => state.dischargeAmount,

    setMood: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ mood: clampedValue })
    },

    setLibido: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ libido: clampedValue })
    },

    setNotes: (value: string | undefined) => {
      return rebuild({ notes: value })
    },

    setSelfPerception: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ selfPerception: clampedValue })
    },

    setEnergy: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ energy: clampedValue })
    },

    setDischargeConsistency: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ dischargeConsistency: clampedValue })
    },

    setDischargeAmount: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ dischargeAmount: clampedValue })
    },

    toJSON: () => ({
      dateKey: state.dateKey,
      mood: state.mood,
      libido: state.libido,
      notes: state.notes,
      selfPerception: state.selfPerception,
      energy: state.energy,
      dischargeConsistency: state.dischargeConsistency,
      dischargeAmount: state.dischargeAmount,
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

/**
 * Format a date range as "DD.MM. – DD.MM."
 */
export function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}.${month}.`
  }
  return `${fmt(start)} \u2013 ${fmt(end)}`
}

/**
 * Compute a rolling mean over chart data for a given numeric field.
 * Uses a backward-looking window of `windowSize` entries.
 * Skips undefined values in the window; returns undefined if the window has no values.
 * Results are rounded to one decimal place.
 */
export function computeRollingMean<T extends Record<string, unknown>>(
  data: T[],
  field: keyof T,
  windowSize: number
): (number | undefined)[] {
  return data.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const windowSlice = data.slice(start, index + 1)
    const values = windowSlice
      .map((item): unknown => item[field])
      .filter((v): v is number => typeof v === 'number')

    if (values.length === 0) return undefined

    const sum = values.reduce((acc, val) => acc + val, 0)
    return Math.round((sum / values.length) * 10) / 10
  })
}
