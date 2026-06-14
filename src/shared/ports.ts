import { PortEntry, Settings } from './types'

// typical local dev-server range — floated above other ports and highlighted
export const isDevPort = (port: number): boolean => port >= 3000 && port <= 9999

// a port counts as recently started if its process began within this window (ms)
export const NEW_PORT_MS = 5 * 60_000

// true if the process started recently (started may be null)
export const isRecentlyStarted = (started: number | null, withinMs = NEW_PORT_MS): boolean =>
  started != null && Date.now() - started < withinMs

// shared float rank for list/tray ordering (higher sorts first):
// pinned +5 (always dominates), dev port +2, recently started +1
export const portRank = (port: PortEntry, settings: Settings): number =>
  (settings.pinned.includes(port.port) ? 5 : 0) +
  (isDevPort(port.port) ? 2 : 0) +
  (isRecentlyStarted(port.started) ? 1 : 0)

// local URL opened in the browser for a listening port
export const localhostUrl = (port: number): string => `http://localhost:${port}`

// shell command that force-kills a pid (copied to clipboard)
export const killCommand = (pid: number): string => `kill -9 ${pid}`
