import { api } from '@renderer/features/shared/lib/api'
import { sleep } from '@renderer/features/shared/lib/utils'
import { useCallback, useState } from 'react'
import { KillSignal, PortEntry } from 'src/shared/types'
import { useSettings } from '../../shared/hooks/use-settings'
import { useRefreshPorts } from './use-refresh-ports'

// poll until the pid is gone or the window elapses; returns true if it exited
async function waitGone(pid: number, ms = 1500): Promise<boolean> {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (!(await api.isAlive(pid))) return true
    await sleep(200)
  }
  return false
}

interface UsePortOperations {
  togglePin: (p: PortEntry) => void
  killSignal: KillSignal
  killTarget: PortEntry | null
  forceTarget: PortEntry | null
  busy: boolean
  askKill: (p: PortEntry) => void
  cancelKill: () => void
  confirmKill: () => Promise<void>
  cancelForce: () => void
  confirmForce: () => Promise<void>
}

// kill flow: SIGTERM with grace-wait, escalating to a SIGKILL confirm if ignored.
// re-lists via the shared refresh primitive once a process actually exits — no
// reference to the list hook.
export function usePortOperations(): UsePortOperations {
  const { settings, updateSettings } = useSettings()
  const refresh = useRefreshPorts()
  const [killTarget, setKillTarget] = useState<PortEntry | null>(null)
  const [forceTarget, setForceTarget] = useState<PortEntry | null>(null)
  const [busy, setBusy] = useState(false) // kill in progress (SIGTERM + grace wait, or SIGKILL)

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

  const confirmKill = useCallback(async () => {
    if (!killTarget || busy) return
    const t = killTarget
    setBusy(true)
    api.track('kill', { source: 'app', signal: settings.killSignal })
    const res = await api.killPort(t.pid, settings.killSignal)
    if (!res.ok) console.error('kill failed:', res.error)
    // poll until it exits; if it ignored the signal, offer to force (unless already SIGKILL)
    const gone = await waitGone(t.pid)
    setBusy(false)
    setKillTarget(null)
    if (gone || settings.killSignal === 'SIGKILL') refresh()
    else setForceTarget(t)
  }, [killTarget, busy, refresh, settings.killSignal])

  const confirmForce = useCallback(async () => {
    if (!forceTarget || busy) return
    setBusy(true)
    const res = await api.killPort(forceTarget.pid, 'SIGKILL')
    if (!res.ok) console.error('force kill failed:', res.error)
    await sleep(400)
    setBusy(false)
    setForceTarget(null)
    refresh()
  }, [forceTarget, busy, refresh])

  return {
    togglePin,
    killSignal: settings.killSignal,
    killTarget,
    forceTarget,
    busy,
    askKill: setKillTarget,
    cancelKill: () => setKillTarget(null),
    confirmKill,
    cancelForce: () => setForceTarget(null),
    confirmForce
  }
}
