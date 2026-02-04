import { describe, expect, it } from 'vitest'
import {
  formatDateKey,
  getDayLabel,
  makeTrackingEntry,
  type TrackingEntry,
  type Symptom,
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

    it('should allow setting motivation between 1 and 5', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const updated = entry.setMotivation(4)

      expect(updated.getMotivation()).toBe(4)
    })

    it('should clamp motivation values to 1-5 range', () => {
      const entry = makeTrackingEntry('2026-01-31')

      expect(entry.setMotivation(0).getMotivation()).toBe(1)
      expect(entry.setMotivation(6).getMotivation()).toBe(5)
    })

    it('should allow setting symptoms as an array', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const symptoms: Symptom[] = ['breastTension', 'bloating']
      const updated = entry.setSymptoms(symptoms)

      expect(updated.getSymptoms()).toEqual(['breastTension', 'bloating'])
    })

    it('should allow adding a single symptom', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withOne = entry.addSymptom('headache')
      const withTwo = withOne.addSymptom('bloating')

      expect(withTwo.getSymptoms()).toEqual(['headache', 'bloating'])
    })

    it('should not add duplicate symptoms', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withSymptom = entry.addSymptom('headache').addSymptom('headache')

      expect(withSymptom.getSymptoms()).toEqual(['headache'])
    })

    it('should allow removing a symptom', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withSymptoms = entry.setSymptoms(['breastTension', 'bloating', 'headache'])
      const removed = withSymptoms.removeSymptom('bloating')

      expect(removed.getSymptoms()).toEqual(['breastTension', 'headache'])
    })

    it('should serialize all new fields to JSON', () => {
      const entry = makeTrackingEntry('2026-01-31')
      const withData = entry
        .setMood(4)
        .setSelfPerception(3)
        .setEnergy(5)
        .setDischargeConsistency(2)
        .setDischargeAmount(4)
        .setSymptoms(['breastTension', 'headache'])

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
        symptoms: ['breastTension', 'headache'],
      })
    })
  })
})
