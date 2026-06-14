import { Settings } from './types'

export const REPO_URL = 'https://github.com/derenko404/port-monitor-app'
export const ISSUES_URL = `${REPO_URL}/issues`

export const POLL_MIN = 5
export const POLL_MAX = 300
export const PORT_MIN = 1
export const PORT_MAX = 65535

export const DEFAULT_SETTINGS: Settings = {
  startOnLogin: false,
  polling: true,
  pollInterval: 60,
  theme: 'system',
  pinned: [],
  portMin: PORT_MIN,
  portMax: PORT_MAX,
  killSignal: 'SIGTERM',
  analytics: true,
  grouping: false,
  resolveContainersNames: true
}
