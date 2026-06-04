import { IconButton } from '../../components/IconButton'

interface ConnectionsToolbarProps {
  readonly canRemove: boolean
  readonly onOpenConnectionModal: () => void
  readonly onRefreshConnections: () => void
  readonly onDeleteSelectedConnection: () => void
}

export function ConnectionsToolbar({
  canRemove,
  onOpenConnectionModal,
  onRefreshConnections,
  onDeleteSelectedConnection,
}: ConnectionsToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <IconButton label="Add connection" icon="+" variant="primary" onClick={onOpenConnectionModal} />
      <IconButton label="Refresh connections" icon="↻" onClick={onRefreshConnections} />
      <IconButton
        label="Remove selected connection"
        icon="−"
        disabled={!canRemove}
        onClick={onDeleteSelectedConnection}
      />
    </div>
  )
}
