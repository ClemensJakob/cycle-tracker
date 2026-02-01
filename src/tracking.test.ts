import { describe, expect, it } from 'vitest'
import { formatDateKey, getDayLabel, makeTrackingEntry, type TrackingEntry } from './tracking'

describe('tracking domain', () => {
  describe('formatDateKey', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const date = new Date(2026, 0, 31) // January 31, 2026
      expect(formatDateKey(date)).toBe('2026-01-31')
    })

    it('should pad single digit months and days with zero', () => {
      const date = new Date(2026, 0, 5) // January 5, 2026
      expect(formatDateKey(date)).toBe('2026-01-05')
    })
  })

  describe('getDayLabel', () => {
    it('should return day name and day of month', () => {
      const date = new Date(2026, 0, 31) // Saturday, January 31, 2026
      const label = getDayLabel(date)
      expect(label.dayName).toBe('Sat')
      expect(label.dayOfMonth).toBe(31)
    })
  })

  describe('makeTrackingEntry', () => {
    it('should create a tracking entry with the given date', () => {
      const dateKey = '2026-01-31'
      const entry = makeTrackingEntry(dateKey)

      expect(entry.getDateKey()).toBe(dateKey)
      expect(entry.getMood()).toBeUndefined()
      expect(entry.getLibido()).toBeUndefined()
    })

    it('should allow setting mood between 1 and 5', () => {
      const entry = makeTrackingEntry('2026-01-31')

      const updated = entry.setMood(3)

      expect(updated.getMood()).toBe(3)
    })

    it('should allow setting libido between 1 and 5', () => {
      const entry = makeTrackingEntry('2026-01-31')

      const updated = entry.setLibido(4)

      expect(updated.getLibido()).toBe(4)
    })

    it('should clamp mood values to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setMood(0).getMood()).toBe(1)
      expect(entry.setMood(6).getMood()).toBe(5)
      expect(entry.setMood(3).getMood()).toBe(3)
    })

    it('should clamp libido values to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setLibido(0).getLibido()).toBe(1)
      expect(entry.setLibido(6).getLibido()).toBe(5)
      expect(entry.setLibido(3).getLibido()).toBe(3)
    })

    it('should allow undefined values for clearing data', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withMood = entry.setMood(5)
      const cleared = withMood.setMood(undefined)

      expect(cleared.getMood()).toBeUndefined()
    })

    it('should serialize to a plain object', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withData = entry.setMood(4).setLibido(3).setNotes('feeling good')

      const serialized = withData.toJSON()

      expect(serialized).toEqual({
        dateKey: '2026-01-31',
        mood: 4,
        libido: 3,
        notes: 'feeling good',
      })
    })

    it('should deserialize from a plain object', () => {
      const data: TrackingEntry = {
        dateKey: '2026-01-31',
        mood: 4,
        libido: 3,
        notes: 'test note',
      }

      const entry = makeTrackingEntry(data.dateKey, data.mood, data.libido, data.notes)

      expect(entry.getDateKey()).toBe('2026-01-31')
      expect(entry.getMood()).toBe(4)
      expect(entry.getLibido()).toBe(3)
      expect(entry.getNotes()).toBe('test note')
    })

    it('should allow setting and clearing notes', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withNotes = entry.setNotes('my note')
      const cleared = withNotes.setNotes(undefined)

      expect(withNotes.getNotes()).toBe('my note')
      expect(cleared.getNotes()).toBeUndefined()
    })

    it('should be immutable - setting values returns a new instance', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const updated = entry.setMood(5)

      expect(entry.getMood()).toBeUndefined()
      expect(updated.getMood()).toBe(5)
    })
  })
})
