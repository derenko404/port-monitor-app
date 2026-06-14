import { atom } from 'jotai'
import { PortEntry, PortsError } from 'src/shared/types'

// kept in a global store so data survives route changes (no skeleton/blink on return)
export const portsAtom = atom<PortEntry[]>([])
export const portsLoadedAtom = atom(false)
// true while a list fetch is in flight (drives the header refresh spinner)
export const portsLoadingAtom = atom(false)
// last list error (e.g. lsof permission denied); null when the last scan succeeded
export const portsErrorAtom = atom<PortsError | null>(null)
