import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { Check, ChevronDown, ChevronUp, Copy, Globe, Info, Loader2, Pin, PinOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from './ui/context-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

function CopyKillItem({ onCopy }: { onCopy: () => void }): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  return (
    <ContextMenuItem
      className="py-1 text-sm"
      onSelect={(e) => {
        e.preventDefault() // keep menu open to show feedback
        onCopy()
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copied!' : 'Copy kill command'}
    </ContextMenuItem>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filter: string
  loading?: boolean
  onInfo: (row: TData) => void
  onKill: (row: TData) => void
  onCopyKill: (row: TData) => void
  onOpenExternal: (row: TData) => void
  onTogglePin: (row: TData) => void
  isPinned: (row: TData) => boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filter,
  loading,
  onInfo,
  onKill,
  onCopyKill,
  onOpenExternal,
  onTogglePin,
  isPinned
}: DataTableProps<TData, TValue>): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'started', desc: true }])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    meta: { onInfo, onKill, onTogglePin },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  // stable partition: pinned float to top, column-sort order kept within each group
  const rows = [...table.getRowModel().rows].sort(
    (a, b) => Number(isPinned(b.original)) - Number(isPinned(a.original))
  )

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="border-0 hover:bg-transparent">
            {hg.headers.map((h) => {
              const sorted = h.column.getIsSorted()
              const sortable = h.column.getCanSort()
              return (
                <TableHead
                  key={h.id}
                  className={cn(
                    'sticky top-0 h-7 select-none bg-card px-3 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors',
                    sortable && 'cursor-pointer hover:text-foreground',
                    sorted ? 'text-foreground' : 'text-muted-foreground/60'
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
            <TableCell colSpan={columns.length} className="py-10">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-xs">Scanning ports…</span>
              </div>
            </TableCell>
          </TableRow>
        ) : rows.length ? (
          rows.map((row) => (
            <ContextMenu key={row.id}>
              <ContextMenuTrigger asChild>
                <TableRow className="group border-b border-border/40 hover:bg-muted/50">
                  {row.getVisibleCells().map((c) => (
                    <TableCell key={c.id} className="py-2 px-3">
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-44">
                <ContextMenuItem className="py-1 text-sm" onSelect={() => onInfo(row.original)}>
                  <Info className="size-4" />
                  Info
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={() => onOpenExternal(row.original)}>
                  <Globe className="size-4" /> Open in browser
                </ContextMenuItem>
                <ContextMenuSeparator />
                <CopyKillItem onCopy={() => onCopyKill(row.original)} />
                <ContextMenuSeparator />
                <ContextMenuItem className="py-1 text-sm" onSelect={() => onTogglePin(row.original)}>
                  {isPinned(row.original) ? (
                    <>
                      <PinOff className="size-4" /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="size-4" /> Pin
                    </>
                  )}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-4">
              No ports
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
