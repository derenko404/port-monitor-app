import { atom } from 'jotai'
import { DEFAULT_SETTINGS } from 'src/shared/constants'
import { Settings } from 'src/shared/types'

// shared so settings survive route changes (no reset-to-default flicker on nav)
export const settingsAtom = atom<Settings>(DEFAULT_SETTINGS)
export const settingsLoadedAtom = atom(false)
