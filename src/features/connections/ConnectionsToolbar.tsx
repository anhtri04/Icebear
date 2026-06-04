import { IconButton } from '../../components/IconButton'

interface ConnectionsToolbarProps {
  readonly canRemove: boolean
}

export function ConnectionsToolbar({ canRemove }: ConnectionsToolbarProps): string {
  return `
    <div class="flex items-center gap-1">
      ${IconButton({ label: 'Add connection', icon: '+', variant: 'primary', dataAction: 'open-connection-modal' })}
      ${IconButton({ label: 'Refresh connections', icon: '↻', dataAction: 'refresh-connections' })}
      ${IconButton({ label: 'Remove selected connection', icon: '−', disabled: !canRemove, dataAction: 'delete-selected-connection' })}
    </div>
  `
}
