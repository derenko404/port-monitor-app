import { ColumnDef } from '@tanstack/react-table'
import { Pin } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PortEntry } from 'src/shared/types'
import { isKnownTech } from '@renderer/features/shared/lib/tech'
import { cn, fmtTimeAgo } from '@renderer/features/shared/lib/utils'
import AppIcon from './components/AppIcon'

export function useColumns(): ColumnDef<PortEntry>[] {
  const { t } = useTranslation()

  return useMemo<ColumnDef<PortEntry>[]>(
    () => [
      {
        accessorKey: 'port',
        header: t('ports.columns.port'),
        cell: ({ row }) => {
          const known = isKnownTech(row.original.command)
          return (
            <span className="flex items-center gap-1.5">
              {row.original.pinned && (
                <Pin className="size-3 shrink-0 fill-current text-sky-700 dark:text-sky-400" />
              )}
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[12px] font-semibold',
                  known
                    ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-400'
                    : 'bg-sky-500/10 text-sky-700 dark:text-sky-400'
                )}
              >
                :{row.original.port}
              </span>
            </span>
          )
        }
      },
      {
        accessorKey: 'command',
        header: t('ports.columns.app'),
        cell: ({ row }) => {
          const name = row.original.command
          return (
            <span className="flex min-w-0 items-center gap-2" title={name}>
              <AppIcon command={name} className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="max-w-28 truncate text-[12px] font-medium text-foreground/90">
                {name}
              </span>
            </span>
          )
        }
      },
      {
        accessorKey: 'pid',
        header: t('ports.columns.pid'),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-[12px]">{row.original.pid}</span>
        )
      },
      {
        accessorKey: 'started',
        header: t('ports.columns.uptime'),
        sortUndefined: 'last',
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap text-[12px]">
            {fmtTimeAgo(row.original.started)}
          </span>
        )
      }
    ],
    [t]
  )
}
