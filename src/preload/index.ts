import '@sentry/electron/preload'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { AnalyticsEvent, AnalyticsProps } from '../shared/analytics'
import { IPC } from '../shared/ipc'

// Custom APIs for renderer
const api = {
  listPorts: () => ipcRenderer.invoke(IPC.ports.list),
  killPort: (pid: number, signal?: string) => ipcRenderer.invoke(IPC.ports.kill, pid, signal),
  isAlive: (pid: number) => ipcRenderer.invoke(IPC.ports.alive, pid),
  onShown: (cb: () => void) => {
    const handler = (): void => cb()
    ipcRenderer.on(IPC.popup.shown, handler)
    return () => ipcRenderer.removeListener(IPC.popup.shown, handler)
  },
  onPortsChanged: (cb: () => void) => {
    const handler = (): void => cb()
    ipcRenderer.on(IPC.ports.changed, handler)
    return () => ipcRenderer.removeListener(IPC.ports.changed, handler)
  },
  getSettings: () => ipcRenderer.invoke(IPC.settings.get),
  setSettings: (patch: Record<string, unknown>) => ipcRenderer.invoke(IPC.settings.set, patch),
  quit: () => ipcRenderer.send(IPC.app.quit),
  getVersion: () => ipcRenderer.invoke(IPC.app.version),
  openExternal: (url: string) => ipcRenderer.invoke(IPC.app.open, url),
  track: (event: AnalyticsEvent, props?: AnalyticsProps) =>
    ipcRenderer.send(IPC.analytics.capture, event, props)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
