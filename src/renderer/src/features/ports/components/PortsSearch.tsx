import { Input } from '@ui/input'
import { Search } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

interface PortsSearchProps {
  value: string
  onChange: (value: string) => void
}

export const PortsSearch = forwardRef<HTMLInputElement, PortsSearchProps>(
  ({ value, onChange }, ref) => {
    const { t } = useTranslation()
    return (
      // docked search bar — matches the list card style
      <div className="px-2.5 pb-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={ref}
            autoFocus
            placeholder={t('ports.search')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 rounded-lg border bg-card pl-9 pr-3 text-sm"
          />
        </div>
      </div>
    )
  }
)

PortsSearch.displayName = 'PortsSearch'

export default PortsSearch
