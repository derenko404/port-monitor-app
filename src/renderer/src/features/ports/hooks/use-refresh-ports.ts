import { api } from '@renderer/features/shared/lib/api'
import { sleep } from '@renderer/features/shared/lib/utils'
import { portsAtom, portsErrorAtom, portsLoadedAtom, portsLoadingAtom } from '@renderer/store/ports'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

// shared list-fetch primitive: re-runs lsof via IPC and writes the result into
// the ports store. both the list and port-operations call this independently, so
// neither hook has to hold a reference to the other.
export function useRefreshPorts(): () => Promise<void> {
  const setPorts = useSetAtom(portsAtom)
  const setLoaded = useSetAtom(portsLoadedAtom)
  const setError = useSetAtom(portsErrorAtom)
  const setLoading = useSetAtom(portsLoadingAtom)

  return useCallback(async () => {
    setLoading(true)
    const [res] = await Promise.all([api.listPorts(), sleep(250)])
    setPorts(res.groups)
    setError(res.error)
    setLoaded(true)
    setLoading(false)
  }, [setPorts, setError, setLoaded, setLoading])
}
