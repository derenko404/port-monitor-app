import { Button } from '@ui/button'
import { Label } from '@ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Switch } from '@ui/switch'
import { Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { KillSignal, Theme } from 'src/shared/types'
import { api } from '../shared/lib/api'
import { AppHeader } from '../shared/components/AppHeader'
import { useSettings } from '../shared/hooks/use-settings'
import { PortRangeField } from './components/PortRangeField'

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="space-y-1.5">
      <h2 className="px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y overflow-hidden rounded-lg border bg-card">{children}</div>
    </section>
  )
}

function SettingRow({
  label,
  desc,
  htmlFor,
  children
}: {
  label: string
  desc?: string
  htmlFor?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <Label htmlFor={htmlFor} className="text-[13px] font-medium">
          {label}
        </Label>
        {desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Settings(): React.JSX.Element {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettings()
  const [version, setVersion] = useState('')

  useEffect(() => {
    api.getVersion().then(setVersion)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <AppHeader
        title={t('settings.title')}
        actions={
          <Button
            variant="ghost"
            size="icon"
            className="size-7 [-webkit-app-region:no-drag]"
            title={t('settings.home')}
            onClick={() => nav(-1)}
          >
            <Home className="size-4" />
          </Button>
        }
      />

      <div className="flex-1 space-y-4 overflow-auto p-3">
        <Section title={t('settings.sections.monitoring')}>
          <SettingRow
            label={t('settings.autoRefresh.label')}
            desc={t('settings.autoRefresh.desc')}
            htmlFor="polling"
          >
            <Switch
              id="polling"
              checked={settings.polling}
              onCheckedChange={(v) => updateSettings({ polling: v })}
            />
          </SettingRow>
          {settings.polling && (
            <SettingRow label={t('settings.refreshInterval.label')}>
              <Select
                value={String(settings.pollInterval)}
                onValueChange={(v) => updateSettings({ pollInterval: Number(v) })}
              >
                <SelectTrigger className="w-28" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">{t('settings.intervals.5')}</SelectItem>
                  <SelectItem value="15">{t('settings.intervals.15')}</SelectItem>
                  <SelectItem value="30">{t('settings.intervals.30')}</SelectItem>
                  <SelectItem value="60">{t('settings.intervals.60')}</SelectItem>
                  <SelectItem value="120">{t('settings.intervals.120')}</SelectItem>
                  <SelectItem value="300">{t('settings.intervals.300')}</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          )}
          <SettingRow label={t('settings.portRange.label')} desc={t('settings.portRange.desc')}>
            <PortRangeField />
          </SettingRow>
          <SettingRow
            label={t('settings.grouping.label')}
            desc={t('settings.grouping.desc')}
            htmlFor="grouping"
          >
            <Switch
              id="grouping"
              checked={settings.grouping}
              onCheckedChange={(v) => updateSettings({ grouping: v })}
            />
          </SettingRow>
          <SettingRow label={t('settings.killSignal.label')} desc={t('settings.killSignal.desc')}>
            <Select
              value={settings.killSignal}
              onValueChange={(v) => updateSettings({ killSignal: v as KillSignal })}
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIGTERM">SIGTERM</SelectItem>
                <SelectItem value="SIGKILL">SIGKILL</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </Section>

        <Section title={t('settings.sections.appearance')}>
          <SettingRow label={t('settings.theme.label')}>
            <Select
              value={settings.theme}
              onValueChange={(v) => updateSettings({ theme: v as Theme })}
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('settings.theme.system')}</SelectItem>
                <SelectItem value="light">{t('settings.theme.light')}</SelectItem>
                <SelectItem value="dark">{t('settings.theme.dark')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </Section>

        <Section title={t('settings.sections.system')}>
          <SettingRow
            label={t('settings.analytics.label')}
            desc={t('settings.analytics.desc')}
            htmlFor="analytics"
          >
            <Switch
              id="analytics"
              checked={settings.analytics}
              onCheckedChange={(v) => updateSettings({ analytics: v })}
            />
          </SettingRow>
        </Section>
      </div>

      <footer className="border-t p-2">
        <p className="text-center text-[11px] text-muted-foreground">
          {version ? t('settings.version', { version }) : ''}
        </p>
      </footer>
    </div>
  )
}

export default Settings
