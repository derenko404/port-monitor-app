import { ElectronAPI } from '@electron-toolkit/preload'
import { AnalyticsEvent, AnalyticsProps } from '../shared/analytics'
import { ListPortsResult, Settings } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listPorts: () => Promise<ListPortsResult>
      killPort: (pid: number, signal?: string) => Promise<{ ok: boolean; error?: string }>
      isAlive: (pid: number) => Promise<boolean>
      onShown: (cb: () => void) => () => void
      onPortsChanged: (cb: () => void) => () => void
      getSettings: () => Promise<Settings>
      setSettings: (patch: Partial<Settings>) => Promise<Settings>
      quit: () => void
      getVersion: () => Promise<string>
      openExternal: (url: string) => Promise<void>
      track: (event: AnalyticsEvent, props?: AnalyticsProps) => void
    }
  }
}
