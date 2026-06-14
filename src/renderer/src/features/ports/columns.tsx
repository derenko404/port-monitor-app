import { ColumnDef } from '@tanstack/react-table'
import { Pin } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PortGroup } from 'src/shared/types'
import { isKnownTech } from '@renderer/features/shared/lib/tech'
import { fmtTimeAgo } from '@renderer/features/shared/lib/utils'
import AppIcon from './components/AppIcon'
import { PortPill } from './components/PortPill'

export function useColumns(): ColumnDef<PortGroup>[] {
  const { t } = useTranslation()

  return useMemo<ColumnDef<PortGroup>[]>(
    () => [
      {
        id: 'port',
        accessorFn: (g) => g.ports[0].port, // lowest port drives sort
        header: t('ports.columns.port'),
        cell: ({ row }) => {
          const { ports } = row.original
          const known = isKnownTech(row.original.command)
          const anyPinned = ports.some((p) => p.pinned)
          const multi = ports.length > 1
          return (
            <span
              className="flex items-center gap-1.5"
              title={ports.map((p) => `:${p.port}`).join('  ')}
            >
              {anyPinned && (
                <Pin className="size-3 shrink-0 fill-current text-sky-700 dark:text-sky-400" />
              )}
              {multi ? (
                <span className="text-[12px] font-medium text-muted-foreground tabular-nums">
                  {t('ports.count', { count: ports.length })}
                </span>
              ) : (
                <PortPill port={ports[0].port} known={known} />
              )}
            </span>
          )
        }
      },
      {
        accessorKey: 'command',
        header: t('ports.columns.app'),
        // absorb slack so the name shows in full when there's room, truncates when not
        meta: { className: 'w-full' },
        cell: ({ row }) => {
          const name = row.original.command
          return (
            <span className="flex min-w-0 items-center gap-2" title={name}>
              <AppIcon command={name} className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate text-[12px] font-medium text-foreground/90">
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
