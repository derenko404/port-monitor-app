import './assets/main.css'

import * as Sentry from '@sentry/electron/renderer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// DSN + transport are inherited from the main process over IPC
Sentry.init({
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    Sentry.captureConsoleIntegration({ levels: ['error'] })
  ]
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </StrictMode>
)
