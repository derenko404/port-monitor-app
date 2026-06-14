import { useSettings } from '@renderer/hooks/use-settings'
import { cn, sleep } from '@renderer/lib/utils'
import { RefreshCw, Search, Settings as SettingsIcon, X } from 'lucide-react'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PortEntry } from 'src/shared/types'
import { portsAtom, portsLoadedAtom } from '../store/ports'
import ethernetMask from '../assets/ethernet-mask.png'
import { columns } from '../columns'
import AppIcon from '../components/AppIcon'
import { DataTable } from '../components/data-table'
import PortInfoDialog from '../components/PortInfoDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog'
import { Button, buttonVariants } from '../components/ui/button'
import { Input } from '../components/ui/input'

function Ports(): React.JSX.Element {
  const nav = useNavigate()

  const [ports, setPorts] = useAtom(portsAtom)
  const [loaded, setLoaded] = useAtom(portsLoadedAtom)
  const [q, setQ] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [infoPort, setInfoPort] = useState<PortEntry | null>(null)
  const [killTarget, setKillTarget] = useState<PortEntry | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings, updateSettings } = useSettings()

  const refresh = useCallback(async () => {
    setSpinning(true)
    const [list] = await Promise.all([window.api.listPorts(), sleep(250)])
    setPorts(list)
    setLoaded(true)
    setSpinning(false)
  }, [])

  // apply port-range filter (pinned ports bypass it), tag with pin state
  const data = ports
    .filter(
      (p) =>
        settings.pinned.includes(p.port) ||
        (p.port >= settings.portMin && p.port <= settings.portMax)
    )
    .map((p) => ({ ...p, pinned: settings.pinned.includes(p.port) }))

  const togglePin = useCallback(
    (p: PortEntry) => {
      const pinned = settings.pinned.includes(p.port)
        ? settings.pinned.filter((x) => x !== p.port)
        : [...settings.pinned, p.port]
      updateSettings({ pinned })
    },
    [settings.pinned, updateSettings]
  )

  const doKill = useCallback(async () => {
    if (!killTarget) return
    const res = await window.api.killPort(killTarget.pid)
    if (!res.ok) console.error('kill failed:', res.error)
    setKillTarget(null)
    refresh()
  }, [killTarget, refresh])

  // Initial data fetch on mount. refresh() sets state after an async IPC call,
  // not synchronously — this is a legit "load from external system" effect, not
  // the cascading-render pattern the rule guards against.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  // on tray reopen: go to ports, refresh, focus + select search
  useEffect(() => {
    return window.api.onShown(() => {
      nav('/')
      refresh()
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [refresh, nav])

  // auto-refresh polling
  useEffect(() => {
    if (!settings.polling) return undefined
    const id = setInterval(refresh, settings.pollInterval * 1000)
    return () => clearInterval(id)
  }, [settings.polling, settings.pollInterval, refresh])

  return (
    <div className="relative flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center gap-2 p-2 border-b">
        <span
          className="ml-1 size-4 shrink-0 bg-foreground"
          style={{
            maskImage: `url(${ethernetMask})`,
            WebkitMaskImage: `url(${ethernetMask})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center'
          }}
        />
        <h1 className="flex flex-1 items-center gap-2 text-sm font-semibold">
          Ports
          {loaded && (
            <span className="rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-medium text-sky-600 tabular-nums dark:text-sky-400">
              {data.length}
            </span>
          )}
        </h1>
        <Button variant="ghost" size="icon" className="size-7" title="Refresh" onClick={refresh}>
          <RefreshCw className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          title="Settings"
          onClick={() => nav('/settings')}
        >
          <SettingsIcon className="size-4" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 p-2.5">
        <div className="flex h-full flex-col overflow-auto rounded-lg border bg-card text-xs text-muted-foreground">
          <DataTable
            columns={columns}
            data={data}
            filter={q}
            loading={!loaded}
            onInfo={setInfoPort}
            onKill={setKillTarget}
            onOpenExternal={(p) => {
              window.api.openExternal(`http://localhost:${p.port}`)
            }}
            onCopyKill={(p) => navigator.clipboard.writeText(`kill -9 ${p.pid}`)}
            onTogglePin={togglePin}
            isPinned={(p) => !!p.pinned}
          />
        </div>
      </div>

      {/* docked search bar — matches the list card style */}
      <div className="px-2.5 pb-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            autoFocus
            placeholder="Search ports, apps, or PIDs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 rounded-lg border bg-card pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <PortInfoDialog port={infoPort} onClose={() => setInfoPort(null)} />

      <AlertDialog open={!!killTarget} onOpenChange={(o) => !o && setKillTarget(null)}>
        <AlertDialogContent className="max-w-[300px] gap-0 p-5">
          <button
            onClick={() => setKillTarget(null)}
            className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <AlertDialogHeader className="items-center gap-3 text-center">
            <span className="grid size-11 place-items-center rounded-xl bg-muted ring-1 ring-border">
              <AppIcon command={killTarget?.command ?? ''} className="size-5" />
            </span>
            <div className="flex flex-col items-center gap-1.5">
              <AlertDialogTitle className="text-sm">Kill this process?</AlertDialogTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">{killTarget?.command}</span>
                <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono font-medium text-sky-700 dark:text-sky-400">
                  :{killTarget?.port}
                </span>
              </div>
            </div>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Sends SIGTERM. Unsaved work in this process will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 flex-row gap-2">
            <AlertDialogCancel className="mt-0 h-9 flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: 'destructive' }), 'h-9 flex-1')}
              onClick={doKill}
            >
              Kill
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Ports
