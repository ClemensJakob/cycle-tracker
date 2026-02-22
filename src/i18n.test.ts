import { beforeEach, describe, expect, it } from 'vitest'
import i18n from './i18n'

describe('i18n', () => {
  beforeEach(async () => {
    // Reset to German before each test
    await i18n.changeLanguage('de')
  })

  it('should initialize with German as default language', () => {
    expect(i18n.language).toBe('de')
  })

  it('should have German translations loaded', () => {
    expect(i18n.t('mood')).toBe('Stimmung')
    expect(i18n.t('energy')).toBe('Energie')
    expect(i18n.t('libido')).toBe('Libido')
  })

  it('should switch to English', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.language).toBe('en')
    expect(i18n.t('mood')).toBe('Mood')
    expect(i18n.t('energy')).toBe('Energy')
    expect(i18n.t('libido')).toBe('Libido')
  })

  it('should translate day labels', () => {
    expect(i18n.t('today')).toBe('Heute')
    expect(i18n.t('yesterday')).toBe('Gestern')
  })

  it('should translate discharge-related terms', () => {
    expect(i18n.t('discharge')).toBe('Ausfluss')
    expect(i18n.t('discharge_glassy_to_creamy')).toBe('Glasig→Cremig')
    expect(i18n.t('discharge_little_to_much')).toBe('Wenig→Viel')
  })

  it('should translate chart labels', () => {
    expect(i18n.t('detailed')).toBe('Detail')
    expect(i18n.t('self_perception')).toBe('Selbstwahrn.')
    expect(i18n.t('consistency')).toBe('Konsistenz')
    expect(i18n.t('amount')).toBe('Menge')
  })

  it('should translate UI elements', () => {
    expect(i18n.t('loading')).toBe('Laden...')
    expect(i18n.t('notes_placeholder')).toBe('Notizen...')
    expect(i18n.t('day')).toBe('Tag')
  })
})
