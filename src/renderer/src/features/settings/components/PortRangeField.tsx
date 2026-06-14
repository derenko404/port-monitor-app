import { Input } from '@ui/input'
import { useEffect, useState } from 'react'
import { PORT_MAX, PORT_MIN } from 'src/shared/constants'
import { useSettings } from '../../shared/hooks/use-settings'

export function PortRangeField(): React.JSX.Element {
  const { settings, updateSettings } = useSettings()

  // edit range as free text; commit (clamp + persist) on blur so typing isn't fought
  const [minStr, setMinStr] = useState(String(settings.portMin))
  const [maxStr, setMaxStr] = useState(String(settings.portMax))
  useEffect(() => {
    // sync local text when persisted range changes (e.g. after clamp on blur)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinStr(String(settings.portMin))
    setMaxStr(String(settings.portMax))
  }, [settings.portMin, settings.portMax])

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={PORT_MIN}
        max={PORT_MAX}
        value={minStr}
        onChange={(e) => setMinStr(e.target.value)}
        onBlur={() => updateSettings({ portMin: minStr.trim() === '' ? PORT_MIN : Number(minStr) })}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="h-7 w-18 text-xs"
      />
      <span className="text-xs text-muted-foreground">–</span>
      <Input
        type="number"
        min={PORT_MIN}
        max={PORT_MAX}
        value={maxStr}
        onChange={(e) => setMaxStr(e.target.value)}
        onBlur={() => updateSettings({ portMax: maxStr.trim() === '' ? PORT_MAX : Number(maxStr) })}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="h-7 w-18 text-xs"
      />
    </div>
  )
}

export default PortRangeField
