import { useMemo, useState } from 'react'
import type { AppState } from '../../appTypes'
import { ConnectionsToolbar } from './ConnectionsToolbar'
import { ConnectionTree } from './ConnectionTree'
import { formatProvider } from './connectionTypes'

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
  const [filterText, setFilterText] = useState('')
  const canRemove = state.selection.type === 'connection' || state.selection.type === 'bucket' || state.selection.type === 'object'

  const filteredState = useMemo((): AppState => {
    const query = filterText.trim().toLowerCase()

    if (!query) {
      return state
    }

    const bucketsByConnectionId: AppState['bucketsByConnectionId'] = {}
    const connections = state.connections.filter((connection) => {
      const buckets = state.bucketsByConnectionId[connection.id] ?? []
      const connectionMatches = [connection.name, connection.provider, formatProvider(connection.provider), connection.endpoint, connection.region]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
      const matchingBuckets = buckets.filter((bucket) => bucket.name.toLowerCase().includes(query))

      if (connectionMatches) {
        bucketsByConnectionId[connection.id] = buckets
        return true
      }

      if (matchingBuckets.length > 0) {
        bucketsByConnectionId[connection.id] = matchingBuckets
        return true
      }

      return false
    })

    return { ...state, connections, bucketsByConnectionId }
  }, [filterText, state])

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
            value={filterText}
            onChange={(event) => setFilterText(event.currentTarget.value)}
            placeholder="Filter connections and buckets..."
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-auto p-3" aria-label="Connection tree">
        <ConnectionTree
          state={filteredState}
          filterText={filterText}
          hasUnfilteredConnections={state.connections.length > 0}
          onOpenConnectionModal={onOpenConnectionModal}
          onSelectConnection={onSelectConnection}
          onSelectBucket={onSelectBucket}
        />
      </nav>
    </aside>
  )
}
