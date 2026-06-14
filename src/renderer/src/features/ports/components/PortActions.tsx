import { cn } from '@renderer/features/shared/lib/utils'
import { Button } from '@ui/button'
import { Check, Copy, Globe, Info, Pin, PinOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PortEntry } from 'src/shared/types'

interface PortActionsProps {
  port: PortEntry
  pinned: boolean
  showCopy: boolean // copy `kill -9 pid` is meaningless for a grouped/proxy port
  onInfo: (p: PortEntry) => void
  onOpenExternal: (p: PortEntry) => void
  onTogglePin: (p: PortEntry) => void
  onCopyKill?: (p: PortEntry) => void
}

// the non-destructive actions shared by every port row: info, open, copy, pin
export function PortActions({
  port,
  pinned,
  showCopy,
  onInfo,
  onOpenExternal,
  onTogglePin,
  onCopyKill
}: PortActionsProps): React.JSX.Element {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-foreground"
        title={t('ports.actions.info')}
        onClick={() => onInfo(port)}
      >
        <Info className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400"
        title={t('ports.actions.openBrowser')}
        onClick={() => onOpenExternal(port)}
      >
        <Globe className="size-4" />
      </Button>
      {showCopy && onCopyKill && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          title={t('ports.actions.copyKill')}
          onClick={() => {
            onCopyKill(port)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'size-7 text-muted-foreground hover:text-foreground',
          pinned && 'text-sky-600 dark:text-sky-400'
        )}
        title={pinned ? t('ports.actions.unpin') : t('ports.actions.pin')}
        onClick={() => onTogglePin(port)}
      >
        {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </Button>
    </div>
  )
}
