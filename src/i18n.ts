import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import JSON translation files
import deTranslations from './locales/de.json'
import enTranslations from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: {
        translation: deTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    supportedLngs: ['de', 'en'],
    fallbackLng: 'en',
    load: 'languageOnly', // Strip region codes (en-US -> en)
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['navigator'],
      caches: [],
    },
  })

export default i18n
