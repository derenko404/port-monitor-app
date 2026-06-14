import { app } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_SETTINGS, POLL_MAX, POLL_MIN, PORT_MAX, PORT_MIN } from '../shared/constants'
import { Settings } from '../shared/types'

const file = (): string => join(app.getPath('userData'), 'settings.json')

let cache: Settings | null = null

export function getSettings(): Settings {
  if (cache) return cache
  try {
    const raw = JSON.parse(readFileSync(file(), 'utf8'))
    cache = sanitize({ ...DEFAULT_SETTINGS, ...raw })
  } catch {
    cache = { ...DEFAULT_SETTINGS }
  }
  return cache
}

export function setSettings(patch: Partial<Settings>): Settings {
  const next = sanitize({ ...getSettings(), ...patch })
  cache = next
  try {
    writeFileSync(file(), JSON.stringify(next, null, 2))
  } catch (err) {
    console.error('settings write failed:', err)
  }
  applyLoginItem(next)
  return next
}

function sanitize(s: Settings): Settings {
  return {
    startOnLogin: !!s.startOnLogin,
    polling: !!s.polling,
    pollInterval: Math.min(POLL_MAX, Math.max(POLL_MIN, Math.round(s.pollInterval))),
    theme: ['dark', 'light', 'system'].includes(s.theme) ? s.theme : 'system',
    killSignal: s.killSignal === 'SIGKILL' ? 'SIGKILL' : 'SIGTERM',
    analytics: s.analytics !== false, // default on
    grouping: s.grouping === true, // default off
    resolveContainersNames: s.resolveContainersNames !== false, // default on
    pinned: s.pinned.filter((port) => Number.isInteger(port)),
    ...sanitizeRange(s)
  }
}

function sanitizeRange(s: Settings): { portMin: number; portMax: number } {
  const clamp = (n: number, fallback: number): number =>
    Number.isFinite(n) ? Math.min(PORT_MAX, Math.max(PORT_MIN, Math.round(n))) : fallback
  let min = clamp(s.portMin, PORT_MIN)
  let max = clamp(s.portMax, PORT_MAX)
  if (min > max) [min, max] = [max, min] // keep min <= max
  return { portMin: min, portMax: max }
}

// reflect startOnLogin into OS login items
export function applyLoginItem(s: Settings): void {
  app.setLoginItemSettings({ openAtLogin: s.startOnLogin, openAsHidden: true })
}
