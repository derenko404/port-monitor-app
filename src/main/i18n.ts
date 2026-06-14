import i18n from 'i18next'
import en from '../shared/locales/en.json'

// english-only for now; shares the same locale files as the renderer
i18n.init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
