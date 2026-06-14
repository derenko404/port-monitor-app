import { Check, Copy, Globe, Info, OctagonX, Pin, PinOff } from 'lucide-react'
import { useState } from 'react'
import { PortEntry } from 'src/shared/types'
import { cn } from '../lib/utils'
import { Button } from './ui/button'

interface PortActionBarProps {
  port: PortEntry
  pinned: boolean
  onInfo: (p: PortEntry) => void
  onOpenExternal: (p: PortEntry) => void
  onCopyKill: (p: PortEntry) => void
  onTogglePin: (p: PortEntry) => void
  onKill: (p: PortEntry) => void
}

export function PortActionBar({
  port,
  pinned,
  onInfo,
  onOpenExternal,
  onCopyKill,
  onTogglePin,
  onKill
}: PortActionBarProps): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  return (
    <div className="mx-8 mb-2 flex items-center gap-2 rounded-b-lg border-x border-b border-border/40 bg-muted/40 px-3 py-1.5 text-foreground">
      {/* safe actions */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400"
          title="Open in browser"
          onClick={() => onOpenExternal(port)}
        >
          <Globe className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          title="Info"
          onClick={() => onInfo(port)}
        >
          <Info className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          title="Copy kill command"
          onClick={() => {
            onCopyKill(port)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-7 text-muted-foreground hover:text-foreground',
            pinned && 'text-sky-600 dark:text-sky-400'
          )}
          title={pinned ? 'Unpin' : 'Pin'}
          onClick={() => onTogglePin(port)}
        >
          {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </Button>
      </div>

      <div className="flex-1" />

      {/* destructive action, separated */}
      <div className="mx-0.5 h-5 w-px bg-border" />
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 border-destructive/30 px-8 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
        title="Kill process (⌘⌫)"
        onClick={() => onKill(port)}
      >
        <OctagonX className="size-4" />
        Kill
      </Button>
    </div>
  )
}
