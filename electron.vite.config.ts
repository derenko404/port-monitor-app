import { resolve } from 'path'
import { defineConfig, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // load unprefixed vars (POSTHOG_KEY, SENTRY_DSN, …) and bake them into the bundles
  const env = loadEnv(mode, process.cwd(), '')
  const dsn = JSON.stringify(env.SENTRY_DSN ?? '')

  return {
    main: {
      define: {
        'import.meta.env.MAIN_VITE_POSTHOG_KEY': JSON.stringify(env.POSTHOG_KEY ?? ''),
        'import.meta.env.MAIN_VITE_POSTHOG_HOST': JSON.stringify(
          env.POSTHOG_HOST ?? 'https://us.i.posthog.com'
        ),
        'import.meta.env.MAIN_VITE_SENTRY_DSN': dsn
      }
    },
    preload: {},
    renderer: {
      define: {
        'import.meta.env.RENDERER_VITE_SENTRY_DSN': dsn
      },
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@ui': resolve('src/renderer/src/components/ui'),
          '@': resolve('src/renderer/src'),
          src: resolve('src')
        }
      },
      plugins: [react(), tailwindcss()]
    }
  }
})
