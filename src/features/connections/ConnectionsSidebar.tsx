import type { AppState } from '../../appTypes'
import { ConnectionsToolbar } from './ConnectionsToolbar'
import { ConnectionTree } from './ConnectionTree'

interface ConnectionsSidebarProps {
  readonly state: AppState
  readonly onOpenConnectionModal: () => void
  readonly onRefreshConnections: () => void
  readonly onDeleteSelectedConnection: () => void
  readonly onSelectConnection: (connectionId: string) => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
}

export function ConnectionsSidebar({
  state,
  onOpenConnectionModal,
  onRefreshConnections,
  onDeleteSelectedConnection,
  onSelectConnection,
  onSelectBucket,
}: ConnectionsSidebarProps) {
  const canRemove = state.selection.type === 'connection' || state.selection.type === 'bucket'

  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-surface-raised">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">Connections</h2>
            <p className="m-0 mt-1 text-xs text-ink-subtle">Saved object storage profiles</p>
          </div>
          <ConnectionsToolbar
            canRemove={canRemove}
            onOpenConnectionModal={onOpenConnectionModal}
            onRefreshConnections={onRefreshConnections}
            onDeleteSelectedConnection={onDeleteSelectedConnection}
          />
        </div>

        <label className="block">
          <span className="sr-only">Filter connections</span>
          <input
            className="h-[var(--input-height)] w-full rounded-icebear-md border border-border bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary"
            type="search"
            placeholder="Filter connections, buckets, prefixes..."
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-auto p-3" aria-label="Connection tree">
        <ConnectionTree
          state={state}
          onOpenConnectionModal={onOpenConnectionModal}
          onSelectConnection={onSelectConnection}
          onSelectBucket={onSelectBucket}
        />
      </nav>
    </aside>
  )
}
