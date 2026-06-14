import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PostHog } from 'posthog-node'
import { AnalyticsEvent, AnalyticsProps } from '../shared/analytics'

const KEY = import.meta.env.MAIN_VITE_POSTHOG_KEY
const HOST = import.meta.env.MAIN_VITE_POSTHOG_HOST

// no key configured (e.g. local dev without .env) → analytics is a no-op
const client = KEY ? new PostHog(KEY, { host: HOST, flushAt: 1, flushInterval: 0 }) : null

interface AnalyticsState {
  anonymousId: string
}

const stateFile = (): string => join(app.getPath('userData'), 'analytics.json')

let state: AnalyticsState | null = null
let freshInstall = false

function load(): AnalyticsState {
  if (state) return state
  try {
    const raw = JSON.parse(readFileSync(stateFile(), 'utf8'))
    state = { anonymousId: typeof raw.anonymousId === 'string' ? raw.anonymousId : randomUUID() }
  } catch {
    // no state file yet → first run on this machine
    freshInstall = true
    state = { anonymousId: randomUUID() }
    try {
      writeFileSync(stateFile(), JSON.stringify(state))
    } catch (err) {
      console.error('analytics state write failed:', err)
    }
  }
  return state
}

export function getDistinctId(): string {
  return load().anonymousId
}

// true only on the very first launch after install (no prior state file).
// retention (day 2/7/…) is derived from app_open in PostHog, not tracked here.
export function isFreshInstall(): boolean {
  load()
  return freshInstall
}

export function capture(event: AnalyticsEvent, properties?: AnalyticsProps): void {
  if (!client) return
  client.capture({ distinctId: getDistinctId(), event, properties })
}

export async function shutdownAnalytics(): Promise<void> {
  await client?.shutdown()
}
