import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enUI from './locales/en/ui.json'

const defaultLocale = (import.meta.env.VITE_DEFAULT_LOCALE as string | undefined) || 'en'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { ui: enUI },
    },
    ns: ['ui'],
    defaultNS: 'ui',
    fallbackLng: 'en',
    lng: defaultLocale,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'pending_locale',
    },
  })

export default i18n
