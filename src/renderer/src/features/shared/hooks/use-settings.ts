import { settingsAtom, settingsLoadedAtom } from '@renderer/store/settings'
import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Settings as SettingsType } from 'src/shared/types'
import { api } from '../lib/api'

type UseSettings = {
  settings: SettingsType
  updateSettings: (patch: Partial<SettingsType>) => Promise<void>
}

export const useSettings = (): UseSettings => {
  const [settings, setSettings] = useAtom(settingsAtom)
  const [loaded, setLoaded] = useAtom(settingsLoadedAtom)

  // load once into the shared store (no-op if main preloaded it before render)
  useEffect(() => {
    if (loaded) return
    api.getSettings().then((s) => {
      setSettings(s)
      setLoaded(true)
    })
  }, [loaded, setSettings, setLoaded])

  const updateSettings = useCallback(
    async (patch: Partial<SettingsType>) => {
      const next = await api.setSettings(patch)
      setSettings(next)
      const keys = Object.keys(patch).filter((k) => k !== 'pinned')
      if (keys.length) api.track('settings', { keys: keys.join(',') })
    },
    [setSettings]
  )

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

  return { settings, updateSettings }
}
