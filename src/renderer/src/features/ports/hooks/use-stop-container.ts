import { api } from '@renderer/features/shared/lib/api'
import { useCallback, useState } from 'react'
import { ContainerPort } from 'src/shared/types'
import { useRefreshPorts } from './use-refresh-ports'

// a container stop targets the service behind a port: `command` is the proxy
// group's command (routes to its resolver), `port` carries the stop handle
interface StopTarget {
  port: ContainerPort
  command: string
}

const STOP_TIMEOUT_MS = 15_000

interface UseStopContainer {
  stopTarget: StopTarget | null
  stopError: 'timeout' | 'failed' | null
  busy: boolean
  askStop: (port: ContainerPort, command: string) => void
  cancelStop: () => void
  confirmStop: () => Promise<void>
}

// stop flow: ask the container service to stop the container, raced against a hard
// timeout so the dialog never hangs; surfaces a timeout/failure message in place.
export function useStopContainer(): UseStopContainer {
  const refresh = useRefreshPorts()
  const [stopTarget, setStopTarget] = useState<StopTarget | null>(null)
  const [stopError, setStopError] = useState<'timeout' | 'failed' | null>(null)
  const [busy, setBusy] = useState(false)

  const askStop = useCallback((port: ContainerPort, command: string) => {
    setStopError(null)
    setStopTarget({ port, command })
  }, [])

  const confirmStop = useCallback(async () => {
    if (!stopTarget || busy) return
    const { command, port } = stopTarget
    setBusy(true)
    setStopError(null)
    api.track('kill', { source: 'app', signal: 'docker-stop' })
    const timeout = new Promise<{ ok: false; error: 'timeout' }>((r) =>
      setTimeout(() => r({ ok: false, error: 'timeout' }), STOP_TIMEOUT_MS)
    )
    const res = await Promise.race([api.stopContainer(command, port.container.id), timeout])
    setBusy(false)
    if (res.ok) {
      setStopTarget(null)
      refresh()
    } else {
      if (res.error !== 'timeout') console.error('stop failed:', res.error)
      setStopError(res.error === 'timeout' ? 'timeout' : 'failed')
    }
  }, [stopTarget, busy, refresh])

  return {
    stopTarget,
    stopError,
    busy,
    askStop,
    cancelStop: () => {
      setStopTarget(null)
      setStopError(null)
    },
    confirmStop
  }
}
