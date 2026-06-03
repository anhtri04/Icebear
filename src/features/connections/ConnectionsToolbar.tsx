import { IconButton } from '../../components/IconButton'

export function ConnectionsToolbar(): string {
  return `
    <div class="flex items-center gap-1">
      ${IconButton({ label: 'Add connection', icon: '+', variant: 'primary' })}
      ${IconButton({ label: 'Refresh connections', icon: '↻' })}
      ${IconButton({ label: 'Remove selected connection', icon: '−', disabled: true })}
    </div>
  `
}
