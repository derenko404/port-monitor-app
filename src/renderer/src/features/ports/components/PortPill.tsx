import { cn } from '@renderer/features/shared/lib/utils'

interface PortPillProps {
  port: number
  known?: boolean // highlight ports of a recognized tech (emerald)
  className?: string
}

// the `:port` chip used across the table, action bar, and dialogs
export function PortPill({ port, known, className }: PortPillProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[12px] font-semibold tabular-nums',
        known
          ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-400'
          : 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
        className
      )}
    >
      :{port}
    </span>
  )
}

export default PortPill
