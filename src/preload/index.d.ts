import { ElectronAPI } from '@electron-toolkit/preload'
import { PortEntry, Settings } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listPorts: () => Promise<PortEntry[]>
      killPort: (pid: number) => Promise<{ ok: boolean; error?: string }>
      onShown: (cb: () => void) => () => void
      onPortsChanged: (cb: () => void) => () => void
      getSettings: () => Promise<Settings>
      setSettings: (patch: Partial<Settings>) => Promise<Settings>
      quit: () => void
      getVersion: () => Promise<string>
      openExternal: (url: string) => Promise<void>
    }
  }
}
