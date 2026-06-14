export interface PortEntry {
  command: string
  pid: number
  port: number
  address: string
  protocol: string
  started: number | null
  pinned?: boolean // set in renderer from persisted pins
}

// one process (pid) and every port it listens on; ports sorted ascending, >=1
export interface PortGroup {
  pid: number
  command: string
  started: number | null
  ports: PortEntry[]
}

export type Theme = 'dark' | 'light' | 'system'
export type KillSignal = 'SIGTERM' | 'SIGKILL'

// why ports could not be listed; null = success (ports may still be empty)
export type PortsError = 'permission' | 'unknown'

export interface ListPortsResult {
  ports: PortEntry[]
  error: PortsError | null
}

export interface Settings {
  startOnLogin: boolean
  polling: boolean
  pollInterval: number // seconds, clamped 15..300
  theme: Theme
  pinned: number[]
  portMin: number // filter range, clamped 1..65535
  portMax: number
  killSignal: KillSignal // default signal sent by the Kill action
  analytics: boolean // opt-in to crash/error reporting (Sentry)
  grouping: boolean // collapse ports sharing a pid into one process row
}
