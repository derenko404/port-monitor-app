import { Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PORT_MAX, PORT_MIN, Theme } from 'src/shared/types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { useSettings } from '../hooks/use-settings'

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
  const { settings, updateSettings } = useSettings()
  const [version, setVersion] = useState('')

  // edit range as free text; commit (clamp + persist) on blur so typing isn't fought
  const [minStr, setMinStr] = useState(String(settings.portMin))
  const [maxStr, setMaxStr] = useState(String(settings.portMax))
  useEffect(() => {
    // sync local text when persisted range changes (e.g. after clamp on blur)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinStr(String(settings.portMin))
    setMaxStr(String(settings.portMax))
  }, [settings.portMin, settings.portMax])

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="relative flex items-center gap-2 border-b p-2 pl-[76px] [-webkit-app-region:drag]">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold">Settings</h1>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-7 [-webkit-app-region:no-drag]"
          title="Home"
          onClick={() => nav(-1)}
        >
          <Home className="size-4" />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-auto p-3">
        <Section title="Monitoring">
          <SettingRow label="Auto-refresh" desc="Periodically re-scan ports." htmlFor="polling">
            <Switch
              id="polling"
              checked={settings.polling}
              onCheckedChange={(v) => updateSettings({ polling: v })}
            />
          </SettingRow>
          {settings.polling && (
            <SettingRow label="Refresh interval">
              <Select
                value={String(settings.pollInterval)}
                onValueChange={(v) => updateSettings({ pollInterval: Number(v) })}
              >
                <SelectTrigger className="w-28" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="15">15s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="120">2m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          )}
          <SettingRow label="Port range" desc="Only show ports in this range.">
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={PORT_MIN}
                max={PORT_MAX}
                value={minStr}
                onChange={(e) => setMinStr(e.target.value)}
                onBlur={() =>
                  updateSettings({ portMin: minStr.trim() === '' ? PORT_MIN : Number(minStr) })
                }
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="h-7 w-[4.5rem] text-xs"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <Input
                type="number"
                min={PORT_MIN}
                max={PORT_MAX}
                value={maxStr}
                onChange={(e) => setMaxStr(e.target.value)}
                onBlur={() =>
                  updateSettings({ portMax: maxStr.trim() === '' ? PORT_MAX : Number(maxStr) })
                }
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="h-7 w-[4.5rem] text-xs"
              />
            </div>
          </SettingRow>
        </Section>

        <Section title="Appearance">
          <SettingRow label="Theme">
            <Select
              value={settings.theme}
              onValueChange={(v) => updateSettings({ theme: v as Theme })}
            >
              <SelectTrigger className="w-28" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </Section>

        <Section title="System">
          <SettingRow
            label="Start on login"
            desc="Launch hidden at system startup."
            htmlFor="startOnLogin"
          >
            <Switch
              id="startOnLogin"
              checked={settings.startOnLogin}
              onCheckedChange={(v) => updateSettings({ startOnLogin: v })}
            />
          </SettingRow>
        </Section>
      </div>

      <footer className="border-t p-2">
        <p className="text-center text-[11px] text-muted-foreground">
          {version ? `v${version}` : ''}
        </p>
      </footer>
    </div>
  )
}

export default Settings
