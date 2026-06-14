import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Settings as SettingsType } from 'src/shared/types'
import { settingsAtom, settingsLoadedAtom } from '../store/settings'

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
    window.api.getSettings().then((s) => {
      setSettings(s)
      setLoaded(true)
    })
  }, [loaded, setSettings, setLoaded])

  const updateSettings = useCallback(
    async (patch: Partial<SettingsType>) => {
      const next = await window.api.setSettings(patch)
      setSettings(next)
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
