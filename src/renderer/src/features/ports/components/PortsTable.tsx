import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowData,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, ChevronUp, Loader2 } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table'
import { cn } from '@renderer/features/shared/lib/utils'

// per-column extra classes (e.g. width hints) carried on ColumnDef.meta
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

interface PortsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filter: string
  loading?: boolean
  onInfo: (row: TData) => void
  onKill: (row: TData) => void
  rank?: (row: TData) => number
  matchesQuery?: (row: TData, query: string) => boolean
  rowKey: (row: TData) => string
  selectedKey: string | null
  onSelect: (row: TData | null) => void
  renderExpanded?: (row: TData) => React.ReactNode
}

export function PortsTable<TData, TValue>({
  columns,
  data,
  filter,
  loading,
  onInfo,
  onKill,
  rank: rankOf,
  matchesQuery,
  rowKey,
  selectedKey,
  onSelect,
  renderExpanded
}: PortsTableProps<TData, TValue>): React.JSX.Element {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'started', desc: true }])
  const selectedRef = useRef<HTMLTableRowElement>(null)

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // custom matcher so a query can hit any field of the row (e.g. any port in a group)
    globalFilterFn: matchesQuery ? (row, _id, value) => matchesQuery(row.original, value) : 'auto'
  })

  // float to the top by caller-supplied rank; column-sort order kept within each tier
  const rank = (r: TData): number => rankOf?.(r) ?? 0
  const rows = [...table.getRowModel().rows].sort((a, b) => rank(b.original) - rank(a.original))

  const select = onSelect

  // clear selection if the selected row left the list (killed, filtered out)
  const visibleKeys = rows.map((r) => rowKey(r.original)).join('|')
  useEffect(() => {
    if (selectedKey && !visibleKeys.split('|').includes(selectedKey)) select(null)
  }, [visibleKeys, selectedKey, select])

  // keep selected row in view when moved by keyboard
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedKey])

  // keyboard navigation: ↑↓ move, ⏎ info, ⌘⌫ kill, esc clear
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (!rows.length) return
      const idx = rows.findIndex((r) => rowKey(r.original) === selectedKey)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        select((rows[Math.min(idx + 1, rows.length - 1)] ?? rows[0]).original)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        select((idx <= 0 ? rows[0] : rows[idx - 1]).original)
      } else if (e.key === 'Escape') {
        if (selectedKey) {
          e.preventDefault()
          select(null)
        }
      } else if (idx >= 0) {
        const sel = rows[idx].original
        if (e.key === 'Enter') {
          e.preventDefault()
          onInfo(sel)
        } else if ((e.metaKey || e.ctrlKey) && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault()
          onKill(sel)
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [rows, selectedKey, select, onInfo, onKill, rowKey])

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="border-0 hover:bg-transparent">
            <TableHead className="sticky top-0 w-6 bg-card" />
            {hg.headers.map((h) => {
              const sorted = h.column.getIsSorted()
              const sortable = h.column.getCanSort()
              return (
                <TableHead
                  key={h.id}
                  className={cn(
                    'sticky top-0 h-7 select-none bg-card px-3 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors',
                    sortable && 'cursor-pointer hover:text-foreground',
                    sorted ? 'text-foreground' : 'text-muted-foreground/60',
                    h.column.columnDef.meta?.className
                  )}
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <span className="inline-flex items-center gap-0.5">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {sorted === 'asc' && <ChevronUp className="size-3" />}
                    {sorted === 'desc' && <ChevronDown className="size-3" />}
                  </span>
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell colSpan={columns.length + 1} className="py-10">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-xs">{t('ports.scanning')}</span>
              </div>
            </TableCell>
          </TableRow>
        ) : rows.length ? (
          rows.map((row) => {
            const selected = rowKey(row.original) === selectedKey
            return (
              <Fragment key={row.id}>
                <TableRow
                  ref={selected ? selectedRef : undefined}
                  onClick={() => select(selected ? null : row.original)}
                  data-selected={selected || undefined}
                  className={cn(
                    'group cursor-pointer border-b border-border/40 hover:bg-muted/50',
                    selected && 'border-transparent bg-sky-500/10 hover:bg-sky-500/10'
                  )}
                >
                  <TableCell className="w-6 pl-2 pr-0">
                    <ChevronRight
                      className={cn(
                        'size-3.5 text-muted-foreground/50 transition-transform',
                        selected && 'rotate-90 text-sky-600 dark:text-sky-400'
                      )}
                    />
                  </TableCell>
                  {row.getVisibleCells().map((c) => (
                    <TableCell
                      key={c.id}
                      className={cn('py-2 px-3', c.column.columnDef.meta?.className)}
                    >
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {selected && renderExpanded && (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={columns.length + 1} className="p-0">
                      {renderExpanded(row.original)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length + 1}
              className="text-center text-muted-foreground py-4"
            >
              {t('ports.empty')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
