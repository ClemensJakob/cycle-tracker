/**
 * Tracking Domain Logic
 *
 * This module contains the core domain logic for tracking daily data.
 * It follows the Crockford object pattern for immutable domain entities.
 */

export type Symptom = 'breastTension' | 'bloating' | 'headache'

export type TrackingEntry = {
  dateKey: string // Format: YYYY-MM-DD
  mood?: number // 1-5
  libido?: number // 1-5
  notes?: string
  selfPerception?: number // 1-5
  energy?: number // 1-5
  dischargeConsistency?: number // 1-5 (1=glassy, 5=creamy)
  dischargeAmount?: number // 1-5 (1=little, 5=much)
  motivation?: number // 1-5
  symptoms?: Symptom[]
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
  getMotivation: () => number | undefined
  getSymptoms: () => Symptom[]
  setMood: (value: number | undefined) => TrackingEntryObject
  setLibido: (value: number | undefined) => TrackingEntryObject
  setNotes: (value: string | undefined) => TrackingEntryObject
  setSelfPerception: (value: number | undefined) => TrackingEntryObject
  setEnergy: (value: number | undefined) => TrackingEntryObject
  setDischargeConsistency: (value: number | undefined) => TrackingEntryObject
  setDischargeAmount: (value: number | undefined) => TrackingEntryObject
  setMotivation: (value: number | undefined) => TrackingEntryObject
  setSymptoms: (value: Symptom[] | undefined) => TrackingEntryObject
  addSymptom: (symptom: Symptom) => TrackingEntryObject
  removeSymptom: (symptom: Symptom) => TrackingEntryObject
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
  dischargeAmount?: number,
  motivation?: number,
  symptoms?: Symptom[]
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
    motivation,
    symptoms,
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
      'dischargeAmount' in updates ? updates.dischargeAmount : state.dischargeAmount,
      'motivation' in updates ? updates.motivation : state.motivation,
      'symptoms' in updates ? updates.symptoms : state.symptoms
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
    getMotivation: () => state.motivation,
    getSymptoms: () => state.symptoms ?? [],

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

    setMotivation: (value: number | undefined) => {
      const clampedValue = value !== undefined ? clamp(value, 1, 5) : undefined
      return rebuild({ motivation: clampedValue })
    },

    setSymptoms: (value: Symptom[] | undefined) => {
      return rebuild({ symptoms: value })
    },

    addSymptom: (symptom: Symptom) => {
      const current = state.symptoms ?? []
      if (current.includes(symptom)) return rebuild({})
      return rebuild({ symptoms: [...current, symptom] })
    },

    removeSymptom: (symptom: Symptom) => {
      const current = state.symptoms ?? []
      return rebuild({ symptoms: current.filter((s) => s !== symptom) })
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
      symptoms: state.symptoms,
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
