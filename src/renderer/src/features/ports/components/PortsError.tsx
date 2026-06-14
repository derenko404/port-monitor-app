import { Button } from '@ui/button'
import { RefreshCw, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PortsError as PortsErrorKind } from 'src/shared/types'

interface PortsErrorProps {
  error: PortsErrorKind
  onRetry: () => void
}

export function PortsError({ error, onRetry }: PortsErrorProps): React.JSX.Element {
  const { t } = useTranslation()
  const title =
    error === 'permission' ? t('ports.error.permissionTitle') : t('ports.error.unknownTitle')
  const desc =
    error === 'permission' ? t('ports.error.permissionDesc') : t('ports.error.unknownDesc')

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-destructive/10 ring-1 ring-destructive/30">
        <ShieldAlert className="size-5 text-destructive" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <Button variant="outline" size="sm" className="mt-1 h-8 gap-1.5" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        {t('ports.error.retry')}
      </Button>
    </div>
  )
}

export default PortsError
