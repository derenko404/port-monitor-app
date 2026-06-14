import { api } from '@renderer/features/shared/lib/api'
import { killCommand, localhostUrl } from 'src/shared/ports'
import { ContainerPort, isContainerPort, PortEntry, PortGroup } from 'src/shared/types'
import { ContainerPortRow } from './ContainerPortRow'
import { ParentKillBar } from './ParentKillBar'
import { ProcessPortRow } from './ProcessPortRow'

interface ExpandedGroupProps {
  group: PortGroup
  onInfo: (p: PortEntry) => void
  onTogglePin: (p: PortEntry) => void
  onKill: (p: PortEntry) => void
  onStop: (p: ContainerPort, command: string) => void
}

const openExternal = (p: PortEntry): void => {
  api.track('open_browser', { source: 'app' })
  api.openExternal(localhostUrl(p.port))
}
const copyKill = (p: PortEntry): void => {
  navigator.clipboard.writeText(killCommand(p.pid))
}

// the expanded contents of a group row: container groups always offer engine-kill +
// per-container stop (even single-port); plain processes only when they share a pid.
// Each port renders as a container row (Stop) or a process row (Kill).
export function ExpandedGroup({
  group,
  onInfo,
  onTogglePin,
  onKill,
  onStop
}: ExpandedGroupProps): React.JSX.Element {
  const grouped = group.kind === 'container-group' || group.ports.length > 1
  return (
    <div className="flex flex-col">
      {grouped && (
        <ParentKillBar
          command={group.command}
          containerService={group.kind === 'container-group'}
          // whole-process kill: no single port (port 0 → dialog hides the pill)
          onKill={() => onKill({ ...group.ports[0], command: group.command, port: 0 })}
        />
      )}
      {group.ports.map((p) =>
        isContainerPort(p) ? (
          <ContainerPortRow
            key={p.port}
            port={p}
            pinned={!!p.pinned}
            label={p.command !== group.command ? p.command : undefined}
            onInfo={onInfo}
            onOpenExternal={openExternal}
            onTogglePin={onTogglePin}
            onStop={(x) => onStop(x, group.command)}
          />
        ) : (
          <ProcessPortRow
            key={p.port}
            port={p}
            pinned={!!p.pinned}
            grouped={grouped}
            label={p.command !== group.command ? p.command : undefined}
            onInfo={onInfo}
            onOpenExternal={openExternal}
            onCopyKill={copyKill}
            onTogglePin={onTogglePin}
            onKill={onKill}
          />
        )
      )}
    </div>
  )
}
