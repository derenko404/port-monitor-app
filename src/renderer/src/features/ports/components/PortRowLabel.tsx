import AppIcon from './AppIcon'
import { PortPill } from './PortPill'

interface PortRowLabelProps {
  port: number
  label?: string // service name (e.g. docker container) when the port resolves to one
}

// expanded-row leading block: the port pill plus, when the port resolves to a
// distinct service, its icon + name (clamped to the available width)
export function PortRowLabel({ port, label }: PortRowLabelProps): React.JSX.Element {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <PortPill port={port} className="text-[11px]" />
      {label && (
        <span className="flex min-w-0 items-center gap-1.5" title={label}>
          <AppIcon command={label} className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate text-[11px] font-medium text-foreground/90">
            {label}
          </span>
        </span>
      )}
    </div>
  )
}
