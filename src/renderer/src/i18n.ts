import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from 'src/shared/locales/en.json'

// english-only for now; add locales to resources + a detector later
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
