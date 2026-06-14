import { api } from '@renderer/features/shared/lib/api'
import { Button } from '@ui/button'
import { RefreshCw, Settings as SettingsIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { killCommand, localhostUrl } from 'src/shared/ports'
import { PortEntry, PortGroup } from 'src/shared/types'
import { AppHeader } from '../shared/components/AppHeader'
import { useColumns } from './columns'
import { ForceKillPortDialog } from './components/ForceKillPortDialog'
import { KillPortDialog } from './components/KillPortDialog'
import { PortActionBar } from './components/PortActionBar'
import PortInfoDialog from './components/PortInfoDialog'
import { PortsError } from './components/PortsError'
import { PortsSearch } from './components/PortsSearch'
import { PortsTable } from './components/PortsTable'
import { usePortOperations } from './hooks/use-port-operations'
import { usePortsList } from './hooks/use-ports-list'

// search hits a group if its command, pid, or any of its ports match
function matchesGroup(g: PortGroup, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (g.command.toLowerCase().includes(q)) return true
  if (String(g.pid).includes(q)) return true
  return g.ports.some((p) => String(p.port).includes(q))
}

function Ports(): React.JSX.Element {
  const nav = useNavigate()
  const { t } = useTranslation()
  const columns = useColumns()

  const { data, loaded, error, spinning, refresh, rank } = usePortsList()
  const {
    togglePin,
    killSignal,
    killTarget,
    forceTarget,
    busy,
    askKill,
    cancelKill,
    confirmKill,
    cancelForce,
    confirmForce
  } = usePortOperations()

  const [q, setQ] = useState('')
  const [infoPort, setInfoPort] = useState<PortEntry | null>(null)
  const [selected, setSelected] = useState<PortGroup | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const portCount = data.reduce((n, g) => n + g.ports.length, 0)

  // track a search once per session (when the box goes from empty to non-empty)
  const onSearch = (value: string): void => {
    if (!q && value) api.track('search')
    setQ(value)
  }

  // on tray reopen: go to ports, refresh, focus + select search
  useEffect(() => {
    return api.onShown(() => {
      nav('/')
      refresh()
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [refresh, nav])

  return (
    <div className="relative flex flex-col h-screen bg-background text-foreground">
      <AppHeader
        title={
          <>
            {t('ports.title')}
            {loaded && !error && (
              <span className="rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-medium text-sky-600 tabular-nums dark:text-sky-400">
                {portCount}
              </span>
            )}
          </>
        }
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 [-webkit-app-region:no-drag]"
              title={t('ports.refresh')}
              onClick={refresh}
            >
              <RefreshCw className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 [-webkit-app-region:no-drag]"
              title={t('ports.settings')}
              onClick={() => nav('/settings')}
            >
              <SettingsIcon className="size-4" />
            </Button>
          </>
        }
      />

      <div className="min-h-0 flex-1 p-2.5">
        <div className="flex h-full flex-col overflow-auto rounded-lg border bg-card text-xs text-muted-foreground">
          {error ? (
            <PortsError error={error} onRetry={refresh} />
          ) : (
            <PortsTable
              columns={columns}
              data={data}
              filter={q}
              loading={!loaded}
              onInfo={(g) => setInfoPort(g.ports[0])}
              onKill={(g) => askKill(g.ports[0])}
              rank={rank}
              matchesQuery={matchesGroup}
              rowKey={(g) => `${g.pid}:${g.ports[0].port}`}
              selectedKey={selected ? `${selected.pid}:${selected.ports[0].port}` : null}
              onSelect={setSelected}
              renderExpanded={(g) => (
                <div className="flex flex-col">
                  {g.ports.map((p) => (
                    <PortActionBar
                      key={p.port}
                      port={p}
                      pinned={!!p.pinned}
                      showPort={g.ports.length > 1}
                      onInfo={setInfoPort}
                      onOpenExternal={(x) => {
                        api.track('open_browser', { source: 'app' })
                        api.openExternal(localhostUrl(x.port))
                      }}
                      onCopyKill={(x) => navigator.clipboard.writeText(killCommand(x.pid))}
                      onTogglePin={togglePin}
                      onKill={askKill}
                    />
                  ))}
                </div>
              )}
            />
          )}
        </div>
      </div>

      {!error && <PortsSearch ref={inputRef} value={q} onChange={onSearch} />}

      <PortInfoDialog port={infoPort} onClose={() => setInfoPort(null)} />

      <KillPortDialog
        target={killTarget}
        busy={busy}
        killSignal={killSignal}
        onConfirm={confirmKill}
        onCancel={cancelKill}
      />

      <ForceKillPortDialog
        target={forceTarget}
        busy={busy}
        onConfirm={confirmForce}
        onCancel={cancelForce}
      />
    </div>
  )
}

export default Ports
