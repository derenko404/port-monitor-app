import { api } from '@renderer/features/shared/lib/api'
import { portsAtom, portsErrorAtom, portsLoadedAtom, portsLoadingAtom } from '@renderer/store/ports'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { portRank } from 'src/shared/ports'
import { PortEntry, PortsError } from 'src/shared/types'
import { useSettings } from '../../shared/hooks/use-settings'
import { useRefreshPorts } from './use-refresh-ports'

interface UsePortsList {
  data: PortEntry[]
  loaded: boolean
  error: PortsError | null
  spinning: boolean
  refresh: () => Promise<void>
  rank: (p: PortEntry) => number
}

// read side of the port list: fetch, range filter, pin tagging, auto-refresh
export function usePortsList(): UsePortsList {
  const { settings } = useSettings()
  const ports = useAtomValue(portsAtom)
  const loaded = useAtomValue(portsLoadedAtom)
  const error = useAtomValue(portsErrorAtom)
  const spinning = useAtomValue(portsLoadingAtom)
  const refresh = useRefreshPorts()

  // apply port-range filter (pinned ports bypass it), tag with pin state
  const data = ports
    .filter(
      (p) =>
        settings.pinned.includes(p.port) ||
        (p.port >= settings.portMin && p.port <= settings.portMax)
    )
    .map((p) => ({ ...p, pinned: settings.pinned.includes(p.port) }))

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

  return { data, loaded, error, spinning, refresh, rank: (p) => portRank(p, settings) }
}
