import { ColumnDef } from '@tanstack/react-table'
import { OctagonX, Pin } from 'lucide-react'
import AppIcon from './components/AppIcon'
import { PortEntry } from 'src/shared/types'
import { Button } from './components/ui/button'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onInfo: (port: TData) => void
    onKill: (port: TData) => void
    onTogglePin: (port: TData) => void
  }
}

export const columns: ColumnDef<PortEntry>[] = [
  {
    accessorKey: 'port',
    header: 'Port',
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5">
        {row.original.pinned && (
          <Pin className="size-3 shrink-0 fill-current text-sky-700 dark:text-sky-400" />
        )}
        <span className="inline-flex items-center rounded-md bg-sky-500/10 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-sky-700 dark:text-sky-400">
          :{row.original.port}
        </span>
      </span>
    )
  },
  {
    accessorKey: 'command',
    header: 'App',
    cell: ({ row }) => {
      const name = row.original.command
      const short = name.length > 8 ? `${name.slice(0, 8)}…` : name
      return (
        <span className="flex items-center gap-2 min-w-0">
          <AppIcon command={name} className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground/90 text-[12px]" title={name}>
            {short}
          </span>
        </span>
      )
    }
  },
  {
    accessorKey: 'pid',
    header: 'PID',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-[12px]">{row.original.pid}</span>
    )
  },
  {
    accessorKey: 'started',
    header: 'Uptime',
    sortUndefined: 'last',
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap text-[12px]">{ago(row.original.started)}</span>
    )
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          title="Kill"
          onClick={() => table.options.meta?.onKill(row.original)}
        >
          <OctagonX className="size-4" />
        </Button>
      </div>
    )
  }
]

function ago(started: number | null): string {
  if (!started) return '—'
  const s = Math.max(0, Math.floor((Date.now() - started) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
