import { Badge } from './Badge'
import type { AppState } from '../appTypes'
import { storageProviderLabels } from '../features/connections/connectionTypes'

interface AppHeaderProps {
  readonly state: AppState
}

export function AppHeader({ state }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-5 shadow-icebear-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-icebear-md bg-primary text-sm font-semibold text-white shadow-icebear-sm">IB</div>
        <div>
          <h1 className="m-0 text-lg font-semibold leading-tight text-ink">Icebear</h1>
          <p className="m-0 text-xs leading-tight text-ink-muted">Object Storage Explorer</p>
        </div>
      </div>

      <div className="hidden min-w-0 items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink-muted md:flex">
        <span className="size-2 rounded-full bg-accent" />
        <span className="truncate">{resolveContextLabel(state)}</span>
      </div>

      <div className="flex items-center gap-2">
        {storageProviderLabels.map((label) => (
          <Badge key={label} variant="primary">
            {label}
          </Badge>
        ))}
      </div>
    </header>
  )
}

function resolveContextLabel(state: AppState): string {
  const { selection } = state

  if (selection.type === 'connection') {
    return state.connections.find((item) => item.id === selection.connectionId)?.name ?? 'No connection selected'
  }

  if (selection.type === 'bucket' || selection.type === 'object') {
    const connection = state.connections.find((item) => item.id === selection.connectionId)
    const prefix = selection.prefix ? ` / ${selection.prefix}` : ''
    const object = selection.type === 'object' ? ` / ${selection.key.split('/').pop() ?? selection.key}` : ''
    return `${connection?.name ?? 'Connection'} / ${selection.bucket}${prefix}${object}`
  }

  return 'No connection selected'
}
