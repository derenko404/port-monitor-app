export type AnalyticsEvent =
  | 'app_install'
  | 'app_open'
  | 'search'
  | 'pin'
  | 'kill'
  | 'open_browser'
  | 'settings'

export type AnalyticsProps = Record<string, string | number | boolean | null>
