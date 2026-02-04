import '@testing-library/jest-dom'
import i18n from '../i18n' // Initialize i18n for tests

// Set language to English for tests
i18n.changeLanguage('en')

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock
