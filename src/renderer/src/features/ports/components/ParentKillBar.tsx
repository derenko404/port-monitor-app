import { Button } from '@ui/button'
import { OctagonX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AppIcon from './AppIcon'

interface ParentKillBarProps {
  command: string
  containerService?: boolean // badge reads "service" (a container engine) vs "parent"
  onKill: () => void
}

export function ParentKillBar({
  command,
  containerService,
  onKill
}: ParentKillBarProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="mx-8 mb-2 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-1.5 text-foreground">
      <span className="flex min-w-0 flex-1 items-center gap-1.5" title={command}>
        <span className="inline-flex shrink-0 items-center rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          {t(containerService ? 'ports.engineBadge' : 'ports.parentBadge')}
        </span>
        <AppIcon command={command} className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate text-[11px] font-medium text-foreground/90">
          {command}
        </span>
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 min-w-24 justify-center gap-1.5 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
        title={t(containerService ? 'ports.actions.killEngine' : 'ports.actions.killProcess')}
        onClick={onKill}
      >
        <OctagonX className="size-4" />
        {t('common.kill')}
      </Button>
    </div>
  )
}
