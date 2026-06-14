import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, Settings as SettingsType } from 'src/shared/types'

type UseSettings = {
  settings: SettingsType
  updateSettings: (patch: Partial<SettingsType>) => Promise<void>
}

export const useSettings = (): UseSettings => {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)

  useEffect(() => {
    window.api.getSettings().then(setSettings)
  }, [])

  const updateSettings = useCallback(async (patch: Partial<SettingsType>) => {
    const next = await window.api.setSettings(patch)
    setSettings(next)
  }, [])

  // apply theme: toggle .dark on <html>; follow OS when 'system'
  useEffect(() => {
    const root = document.documentElement
    const setDark = (dark: boolean): void => {
      root.classList.toggle('dark', dark)
    }

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      setDark(mq.matches)
      const onChange = (e: MediaQueryListEvent): void => setDark(e.matches)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
    setDark(settings.theme === 'dark')
    return undefined
  }, [settings.theme])

  return {
    settings,
    updateSettings
  }
}
