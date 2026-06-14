import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@ui/alert-dialog'
import { buttonVariants } from '@ui/button'
import { cn } from '@renderer/features/shared/lib/utils'
import { Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PortEntry } from 'src/shared/types'
import AppIcon from './AppIcon'
import { PortPill } from './PortPill'

interface ForceKillPortDialogProps {
  target: PortEntry | null
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ForceKillPortDialog({
  target,
  busy,
  onConfirm,
  onCancel
}: ForceKillPortDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <AlertDialog open={!!target} onOpenChange={(o) => !o && !busy && onCancel()}>
      <AlertDialogContent className="max-w-[300px] gap-0 p-5">
        <button
          onClick={onCancel}
          disabled={busy}
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:opacity-30"
          aria-label={t('common.close')}
        >
          <X className="size-4" />
        </button>
        <AlertDialogHeader className="items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
            <AppIcon command={target?.command ?? ''} className="size-5" />
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <AlertDialogTitle className="text-sm">{t('dialogs.forceKill.title')}</AlertDialogTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground">{target?.command}</span>
              {target && <PortPill port={target.port} className="text-[11px] font-medium" />}
            </div>
          </div>
          <AlertDialogDescription className="text-xs leading-relaxed">
            {t('dialogs.forceKill.desc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 flex-row gap-2">
          <AlertDialogCancel disabled={busy} className="mt-0 h-9 flex-1">
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }), 'h-9 flex-1 gap-1.5')}
            disabled={busy}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> {t('common.killing')}
              </>
            ) : (
              t('dialogs.forceKill.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ForceKillPortDialog
