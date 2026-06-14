import { atom } from 'jotai'
import { PortEntry } from 'src/shared/types'

// kept in a global store so data survives route changes (no skeleton/blink on return)
export const portsAtom = atom<PortEntry[]>([])
export const portsLoadedAtom = atom(false)
