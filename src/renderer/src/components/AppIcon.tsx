import { createElement } from 'react'
import { iconFor } from '../lib/tech'

interface AppIconProps {
  command: string
  className?: string
}

function AppIcon({ command, className }: AppIconProps): React.JSX.Element {
  const [Icon, hex] = iconFor(command)
  return createElement(Icon, {
    className: className ?? 'size-4',
    style: hex ? { color: hex } : undefined
  })
}

export default AppIcon
