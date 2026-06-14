import { ColumnDef } from '@tanstack/react-table'
import { Pin } from 'lucide-react'
import { PortEntry } from 'src/shared/types'
import AppIcon from './components/AppIcon'
import { fmtTimeAgo } from './lib/utils'

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
    cell: ({ row }) => <span className="text-muted-foreground text-[12px]">{row.original.pid}</span>
  },
  {
    accessorKey: 'started',
    header: 'Uptime',
    sortUndefined: 'last',
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap text-[12px]">
        {fmtTimeAgo(row.original.started)}
      </span>
    )
  }
]
