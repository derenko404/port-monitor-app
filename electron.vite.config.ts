import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
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
})
