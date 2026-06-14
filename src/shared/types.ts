interface PortEntryBase {
  command: string
  pid: number
  port: number
  address: string
  protocol: string
  started: number | null
  pinned?: boolean // set in renderer from persisted pins
}

// a plain listening port owned by its pid
export interface ProcessPort extends PortEntryBase {
  kind: 'process'
}

// a port resolved to a container behind a proxy (docker, …); carries its handle/metadata
export interface ContainerPort extends PortEntryBase {
  kind: 'container'
  container: { id: string }
}

export type PortEntry = ProcessPort | ContainerPort

export const isContainerPort = (p: PortEntry): p is ContainerPort => p.kind === 'container'

// how a group is handled: a normal process, or a container-service proxy (docker,
// podman, …) whose ports map to containers — stopped individually, not killed by pid
export type GroupType = 'process-group' | 'container-group'

export interface PortGroup {
  pid: number
  command: string
  started: number | null
  ports: PortEntry[]
  kind: GroupType
}

export type Theme = 'dark' | 'light' | 'system'
export type KillSignal = 'SIGTERM' | 'SIGKILL'

// why ports could not be listed; null = success (ports may still be empty)
export type PortsError = 'permission' | 'unknown'

export interface ListPortsResult {
  groups: PortGroup[]
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
  resolveContainersNames: boolean // query Docker socket to name containers behind ports
}
