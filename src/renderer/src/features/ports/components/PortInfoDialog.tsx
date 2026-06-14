import { useTranslation } from 'react-i18next'
import { PortEntry } from 'src/shared/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog'
import AppIcon from './AppIcon'

interface PortInfoDialogProps {
  port: PortEntry | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  )
}

function PortInfoDialog({ port: p, onClose }: PortInfoDialogProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-75 gap-0 p-5">
        <DialogHeader className="items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-muted ring-1 ring-border">
            <AppIcon command={p?.command ?? ''} className="size-5" />
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <DialogTitle className="text-sm">{p?.command}</DialogTitle>
            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-sky-700 dark:text-sky-400">
              :{p?.port}
            </span>
          </div>
        </DialogHeader>

        {p && (
          <div className="mt-4 divide-y rounded-lg border text-xs">
            <Row label={t('ports.info.protocol')} value={p.protocol || t('ports.info.empty')} />
            <Row label={t('ports.info.pid')} value={p.pid} />
            <Row label={t('ports.info.address')} value={p.address} />
            <Row
              label={t('ports.info.started')}
              value={p.started ? new Date(p.started).toLocaleString() : t('ports.info.empty')}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PortInfoDialog
