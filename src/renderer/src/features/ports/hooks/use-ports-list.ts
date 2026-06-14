import { api } from '@renderer/features/shared/lib/api'
import { portsAtom, portsErrorAtom, portsLoadedAtom, portsLoadingAtom } from '@renderer/store/ports'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { groupRank, toRows } from 'src/shared/ports'
import { PortEntry, PortGroup, PortsError } from 'src/shared/types'
import { useSettings } from '../../shared/hooks/use-settings'
import { useRefreshPorts } from './use-refresh-ports'

interface UsePortsList {
  data: PortGroup[]
  loaded: boolean
  error: PortsError | null
  spinning: boolean
  refresh: () => Promise<void>
  rank: (g: PortGroup) => number
  togglePin: (p: PortEntry) => void
}

// read side of the port list: fetch, range filter, pin tagging, auto-refresh
export function usePortsList(): UsePortsList {
  const { settings, updateSettings } = useSettings()
  const ports = useAtomValue(portsAtom)
  const loaded = useAtomValue(portsLoadedAtom)
  const error = useAtomValue(portsErrorAtom)
  const spinning = useAtomValue(portsLoadingAtom)
  const refresh = useRefreshPorts()

  const togglePin = useCallback(
    (p: PortEntry) => {
      const isPinned = settings.pinned.includes(p.port)
      const pinned = isPinned
        ? settings.pinned.filter((x) => x !== p.port)
        : [...settings.pinned, p.port]
      updateSettings({ pinned })
      api.track('pin', { pinned: !isPinned, port: p.port })
    },
    [settings.pinned, updateSettings]
  )

  const inRange = (p: PortEntry): boolean =>
    settings.pinned.includes(p.port) || (p.port >= settings.portMin && p.port <= settings.portMax)
  const tag = (p: PortEntry): PortEntry => ({ ...p, pinned: settings.pinned.includes(p.port) })

  const visible = ports
    .map((g) => {
      const kept = g.ports.filter(inRange).map(tag)
      return kept.length ? { ...g, ports: kept } : null
    })
    .filter((g): g is PortGroup => g !== null)

  const data = toRows(visible, settings.grouping)

  // initial data fetch on mount
  useEffect(() => {
    refresh()
  }, [refresh])

  // re-scan when a port is killed from the tray menu
  useEffect(() => api.onPortsChanged(refresh), [refresh])

  // auto-refresh polling
  useEffect(() => {
    if (!settings.polling) return undefined
    const id = setInterval(refresh, settings.pollInterval * 1000)
    return () => clearInterval(id)
  }, [settings.polling, settings.pollInterval, refresh])

  return { data, loaded, error, spinning, refresh, rank: (g) => groupRank(g, settings), togglePin }
}
