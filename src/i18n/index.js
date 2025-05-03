import { createI18n } from 'vue-i18n'

// Import locale messages
import enLocale from './locales/en.json'
import frLocale from './locales/fr.json'
import deLocale from './locales/de.json'

// Determine the user's preferred language
const getInitialLanguage = () => {
  // Check localStorage first
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) return savedLanguage

  // Then check browser language
  const browserLang = navigator.language.split('-')[0]
  const supportedLanguages = ['en', 'fr', 'de']
  
  return supportedLanguages.includes(browserLang) ? browserLang : 'en'
}

// Create I18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLanguage(), // Set initial locale
  fallbackLocale: 'en', // Fallback to English if translation is missing
  messages: {
    en: enLocale,
    fr: frLocale,
    de: deLocale
  }
})

export default i18n