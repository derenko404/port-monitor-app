export interface PortEntry {
  command: string
  pid: number
  port: number
  address: string
  protocol: string
  started: number | null
  pinned?: boolean // set in renderer from persisted pins
}

export type Theme = 'dark' | 'light' | 'system'

export const POLL_MIN = 5
export const POLL_MAX = 300
export const PORT_MIN = 1
export const PORT_MAX = 65535

export interface Settings {
  startOnLogin: boolean
  polling: boolean
  pollInterval: number // seconds, clamped 15..300
  theme: Theme
  pinned: number[]
  portMin: number // filter range, clamped 1..65535
  portMax: number
}

export const DEFAULT_SETTINGS: Settings = {
  startOnLogin: false,
  polling: true,
  pollInterval: 60,
  theme: 'system',
  pinned: [],
  portMin: PORT_MIN,
  portMax: PORT_MAX
}
