import { describe, expect, it } from 'vitest'
import {
  computeRollingMean,
  formatDateKey,
  formatDateRange,
  getDayLabel,
  makeTrackingEntry,
  type TrackingEntry,
} from './tracking'

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

  describe('formatDateRange', () => {
    it('should format a date range as DD.MM. - DD.MM.', () => {
      const start = new Date(2026, 0, 13) // January 13
      const end = new Date(2026, 1, 11) // February 11
      expect(formatDateRange(start, end)).toBe('13.01. – 11.02.')
    })

    it('should handle same-month ranges', () => {
      const start = new Date(2026, 0, 1)
      const end = new Date(2026, 0, 30)
      expect(formatDateRange(start, end)).toBe('01.01. – 30.01.')
    })

    it('should handle year-crossing ranges', () => {
      const start = new Date(2025, 11, 15) // December 15
      const end = new Date(2026, 0, 13) // January 13
      expect(formatDateRange(start, end)).toBe('15.12. – 13.01.')
    })
  })

  describe('computeRollingMean', () => {
    it('should compute 3-day rolling mean for a numeric field', () => {
      const data = [
        { day: '1', mood: 2 },
        { day: '2', mood: 4 },
        { day: '3', mood: 3 },
        { day: '4', mood: 5 },
        { day: '5', mood: 1 },
      ]

      const result = computeRollingMean(data, 'mood', 3)

      // Day 1: only 1 value => 2
      expect(result[0]).toBe(2)
      // Day 2: avg(2,4) => 3
      expect(result[1]).toBe(3)
      // Day 3: avg(2,4,3) => 3
      expect(result[2]).toBe(3)
      // Day 4: avg(4,3,5) => 4
      expect(result[3]).toBe(4)
      // Day 5: avg(3,5,1) => 3
      expect(result[4]).toBe(3)
    })

    it('should skip undefined values in rolling window', () => {
      const data = [
        { day: '1', mood: undefined },
        { day: '2', mood: 4 },
        { day: '3', mood: undefined },
        { day: '4', mood: 2 },
      ]

      const result = computeRollingMean(data, 'mood', 3)

      // Day 1: no values => undefined
      expect(result[0]).toBeUndefined()
      // Day 2: only 4 => 4
      expect(result[1]).toBe(4)
      // Day 3: only 4 => 4
      expect(result[2]).toBe(4)
      // Day 4: avg(4,2) => 3
      expect(result[3]).toBe(3)
    })

    it('should return all undefined for fully empty data', () => {
      const data = [
        { day: '1', mood: undefined },
        { day: '2', mood: undefined },
      ]

      const result = computeRollingMean(data, 'mood', 3)

      expect(result[0]).toBeUndefined()
      expect(result[1]).toBeUndefined()
    })

    it('should round to one decimal place', () => {
      const data = [
        { day: '1', mood: 1 },
        { day: '2', mood: 2 },
        { day: '3', mood: 3 },
      ]

      const result = computeRollingMean(data, 'mood', 3)

      // avg(1,2,3) = 2
      expect(result[2]).toBe(2)
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

    it('should allow setting selfPerception between 1 and 5', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const updated = entry.setSelfPerception(4)

      expect(updated.getSelfPerception()).toBe(4)
    })

    it('should clamp selfPerception values to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setSelfPerception(0).getSelfPerception()).toBe(1)
      expect(entry.setSelfPerception(6).getSelfPerception()).toBe(5)
      expect(entry.setSelfPerception(3).getSelfPerception()).toBe(3)
    })

    it('should allow setting energy between 1 and 5', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const updated = entry.setEnergy(3)

      expect(updated.getEnergy()).toBe(3)
    })

    it('should clamp energy values to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setEnergy(0).getEnergy()).toBe(1)
      expect(entry.setEnergy(6).getEnergy()).toBe(5)
    })

    it('should allow setting discharge consistency (1=glassy, 5=creamy)', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const updated = entry.setDischargeConsistency(2)

      expect(updated.getDischargeConsistency()).toBe(2)
    })

    it('should clamp discharge consistency to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setDischargeConsistency(0).getDischargeConsistency()).toBe(1)
      expect(entry.setDischargeConsistency(6).getDischargeConsistency()).toBe(5)
    })

    it('should allow setting discharge amount (1=little, 5=much)', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const updated = entry.setDischargeAmount(4)

      expect(updated.getDischargeAmount()).toBe(4)
    })

    it('should clamp discharge amount to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setDischargeAmount(0).getDischargeAmount()).toBe(1)
      expect(entry.setDischargeAmount(6).getDischargeAmount()).toBe(5)
    })

    it('should serialize all new fields to JSON', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withData = entry
        .setMood(4)
        .setSelfPerception(3)
        .setEnergy(5)
        .setDischargeConsistency(2)
        .setDischargeAmount(4)

      const serialized = withData.toJSON()

      expect(serialized).toEqual({
        dateKey: '2026-01-31',
        mood: 4,
        libido: undefined,
        notes: undefined,
        selfPerception: 3,
        energy: 5,
        dischargeConsistency: 2,
        dischargeAmount: 4,
      })
    })
  })
})
