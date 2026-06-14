import { Button } from '@ui/button'
import { Square } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ContainerPort, PortEntry } from 'src/shared/types'
import { PortActions } from './PortActions'
import { PortRowLabel } from './PortRowLabel'

interface ContainerPortRowProps {
  port: ContainerPort
  pinned: boolean
  rounded?: boolean
  label?: string
  onInfo: (p: PortEntry) => void
  onOpenExternal: (p: PortEntry) => void
  onTogglePin: (p: PortEntry) => void
  onStop: (p: ContainerPort) => void
}

// a container behind a proxy port (docker, …). Its pid is the engine, so it's
// stopped via the container service, never killed by pid. No copy-kill.
export function ContainerPortRow({
  port,
  pinned,
  rounded,
  label,
  onInfo,
  onOpenExternal,
  onTogglePin,
  onStop
}: ContainerPortRowProps): React.JSX.Element {
  const { t } = useTranslation()
  const border = rounded ? 'mt-1 rounded-lg border' : 'rounded-b-lg border-x border-b'
  return (
    <div
      className={`mx-8 mb-2 flex items-center gap-2 ${border} border-border/40 bg-muted/40 px-3 py-1.5 text-foreground`}
    >
      <PortRowLabel port={port.port} label={label} />

      <PortActions
        port={port}
        pinned={pinned}
        showCopy={false}
        onInfo={onInfo}
        onOpenExternal={onOpenExternal}
        onTogglePin={onTogglePin}
      />

      <div className="mx-0.5 h-5 w-px bg-border" />
      <Button
        variant="outline"
        size="sm"
        className="h-7 min-w-24 justify-center gap-1.5 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
        title={t('ports.actions.stopContainer')}
        onClick={() => onStop(port)}
      >
        <Square className="size-4" />
        {t('common.stop')}
      </Button>
    </div>
  )
}
