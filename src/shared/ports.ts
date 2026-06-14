import { PortEntry, PortGroup, Settings } from './types'

export const isDevPort = (port: number): boolean => port >= 3000 && port <= 9999

export const NEW_PORT_MS = 5 * 60_000

export const isRecentlyStarted = (started: number | null, withinMs = NEW_PORT_MS): boolean =>
  started != null && Date.now() - started < withinMs

export const portRank = (port: PortEntry, settings: Settings): number =>
  (settings.pinned.includes(port.port) ? 5 : 0) +
  (isDevPort(port.port) ? 2 : 0) +
  (isRecentlyStarted(port.started) ? 1 : 0)

export const groupRank = (g: PortGroup, settings: Settings): number =>
  Math.max(...g.ports.map((p) => portRank(p, settings)))

export const groupByPid = (ports: PortEntry[]): PortGroup[] => {
  const byPid = new Map<number, PortEntry[]>()
  for (const p of ports) {
    const arr = byPid.get(p.pid)
    if (arr) arr.push(p)
    else byPid.set(p.pid, [p])
  }
  return [...byPid.values()].map((ps) => {
    const sorted = [...ps].sort((a, b) => a.port - b.port)
    const { pid, command, started } = sorted[0]
    // 'process' by default; main upgrades container-service proxies after resolving
    return { pid, command, started, ports: sorted, kind: 'process-group' as const }
  })
}

// ungrouped: each port becomes its own plain row (a flattened container reads as
// itself and keeps Stop via its resolved container — no proxy aggregate, so 'process')
export const toRows = (groups: PortGroup[], grouping: boolean): PortGroup[] =>
  grouping
    ? groups
    : groups.flatMap((g) =>
        g.ports.map((p) => ({
          pid: p.pid,
          command: p.command,
          started: p.started,
          ports: [p],
          kind: 'process-group' as const
        }))
      )

// local URL opened in the browser for a listening port
export const localhostUrl = (port: number): string => `http://localhost:${port}`

// shell command that force-kills a pid (copied to clipboard)
export const killCommand = (pid: number): string => `kill -9 ${pid}`
