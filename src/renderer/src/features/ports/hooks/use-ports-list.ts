import { api } from '@renderer/features/shared/lib/api'
import { portsAtom, portsErrorAtom, portsLoadedAtom, portsLoadingAtom } from '@renderer/store/ports'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { groupPorts, groupRank } from 'src/shared/ports'
import { PortGroup, PortsError } from 'src/shared/types'
import { useSettings } from '../../shared/hooks/use-settings'
import { useRefreshPorts } from './use-refresh-ports'

interface UsePortsList {
  data: PortGroup[]
  loaded: boolean
  error: PortsError | null
  spinning: boolean
  refresh: () => Promise<void>
  rank: (g: PortGroup) => number
}

// read side of the port list: fetch, range filter, pin tagging, auto-refresh
export function usePortsList(): UsePortsList {
  const { settings } = useSettings()
  const ports = useAtomValue(portsAtom)
  const loaded = useAtomValue(portsLoadedAtom)
  const error = useAtomValue(portsErrorAtom)
  const spinning = useAtomValue(portsLoadingAtom)
  const refresh = useRefreshPorts()

  // apply port-range filter (pinned ports bypass it), tag pin state
  const visible = ports
    .filter(
      (p) =>
        settings.pinned.includes(p.port) ||
        (p.port >= settings.portMin && p.port <= settings.portMax)
    )
    .map((p) => ({ ...p, pinned: settings.pinned.includes(p.port) }))

  const data = groupPorts(visible, settings.grouping)

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

  return { data, loaded, error, spinning, refresh, rank: (g) => groupRank(g, settings) }
}
