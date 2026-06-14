import { cn } from '@renderer/features/shared/lib/utils'
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
import { Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { KillSignal, PortEntry } from 'src/shared/types'
import AppIcon from './AppIcon'

interface KillPortDialogProps {
  target: PortEntry | null
  busy: boolean
  killSignal: KillSignal
  onConfirm: () => void
  onCancel: () => void
}

export function KillPortDialog({
  target,
  busy,
  killSignal,
  onConfirm,
  onCancel
}: KillPortDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <AlertDialog open={!!target} onOpenChange={(o) => !o && !busy && onCancel()}>
      <AlertDialogContent className="max-w-75 gap-0 p-5">
        <button
          onClick={onCancel}
          disabled={busy}
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:opacity-30"
          aria-label={t('common.close')}
        >
          <X className="size-4" />
        </button>
        <AlertDialogHeader className="items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-muted ring-1 ring-border">
            <AppIcon command={target?.command ?? ''} className="size-5" />
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <AlertDialogTitle className="text-sm">{t('dialogs.kill.title')}</AlertDialogTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground">{target?.command}</span>
              <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono font-medium text-sky-700 dark:text-sky-400">
                :{target?.port}
              </span>
            </div>
          </div>
          <AlertDialogDescription className="text-xs leading-relaxed">
            {killSignal === 'SIGKILL'
              ? t('dialogs.kill.descSigkill')
              : t('dialogs.kill.descSigterm')}
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
              // keep dialog open through the SIGTERM + poll
              e.preventDefault()
              onConfirm()
            }}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> {t('common.killing')}
              </>
            ) : (
              t('dialogs.kill.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default KillPortDialog
