import './assets/main.css'

import * as Sentry from '@sentry/electron/renderer'
import { getDefaultStore } from 'jotai'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { Theme } from 'src/shared/types'
import App from './App'
import { settingsAtom, settingsLoadedAtom } from './store/settings'

if (import.meta.env.PROD) {
  Sentry.init({
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      Sentry.captureConsoleIntegration({ levels: ['error'] })
    ]
  })
}

const store = getDefaultStore()

function applyTheme(theme: Theme): void {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

// preload settings into the store before first paint → no default→real flicker
async function boot(): Promise<void> {
  try {
    const s = await window.api.getSettings()
    store.set(settingsAtom, s)
    store.set(settingsLoadedAtom, true)
    applyTheme(s.theme)
  } catch {
    // fall back to defaults already in the atom
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </StrictMode>
  )
}

boot()
