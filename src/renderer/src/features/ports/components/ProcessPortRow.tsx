import { Button } from '@ui/button'
import { OctagonX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PortEntry } from 'src/shared/types'
import { PortActions } from './PortActions'
import { PortRowLabel } from './PortRowLabel'

interface ProcessPortRowProps {
  port: PortEntry
  pinned: boolean
  grouped: boolean // this pid owns multiple ports — killing one kills them all
  rounded?: boolean
  label?: string
  onInfo: (p: PortEntry) => void
  onOpenExternal: (p: PortEntry) => void
  onCopyKill: (p: PortEntry) => void
  onTogglePin: (p: PortEntry) => void
  onKill: (p: PortEntry) => void
}

// a plain process port. Single-port: Kill works (it's the process). Grouped: ports
// share a pid, so per-port Kill is disabled — the parent bar kills the process.
export function ProcessPortRow({
  port,
  pinned,
  grouped,
  rounded,
  label,
  onInfo,
  onOpenExternal,
  onCopyKill,
  onTogglePin,
  onKill
}: ProcessPortRowProps): React.JSX.Element {
  const { t } = useTranslation()
  const border = rounded ? 'mt-1 rounded-lg border' : 'rounded-b-lg border-x border-b'
  return (
    <div
      className={`mx-8 mb-2 flex items-center gap-2 ${border} border-border/40 bg-muted/40 px-3 py-1.5 text-foreground`}
    >
      {grouped && <PortRowLabel port={port.port} label={label} />}

      <PortActions
        port={port}
        pinned={pinned}
        showCopy={!grouped}
        onInfo={onInfo}
        onOpenExternal={onOpenExternal}
        onCopyKill={onCopyKill}
        onTogglePin={onTogglePin}
      />

      {!grouped && <div className="flex-1" />}

      <div className="mx-0.5 h-5 w-px bg-border" />
      {/* span carries the tooltip when disabled (a disabled button gets no hover) */}
      <span title={grouped ? t('ports.actions.killGrouped') : undefined}>
        <Button
          variant="outline"
          size="sm"
          disabled={grouped}
          className="h-7 min-w-24 justify-center gap-1.5 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          title={grouped ? undefined : t('ports.actions.kill')}
          onClick={() => onKill(port)}
        >
          <OctagonX className="size-4" />
          {t('common.kill')}
        </Button>
      </span>
    </div>
  )
}
