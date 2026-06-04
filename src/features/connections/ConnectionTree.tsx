import { Button } from '../../components/Button'
import type { AppState } from '../../appTypes'
import { ConnectionTreeItem } from './ConnectionTreeItem'

interface ConnectionTreeProps {
  readonly state: AppState
  readonly filterText?: string
  readonly hasUnfilteredConnections?: boolean
  readonly onOpenConnectionModal: () => void
  readonly onSelectConnection: (connectionId: string) => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
}

export function ConnectionTree({
  state,
  filterText = '',
  hasUnfilteredConnections = false,
  onOpenConnectionModal,
  onSelectConnection,
  onSelectBucket,
}: ConnectionTreeProps) {
  if (state.isLoadingConnections) {
    return <p className="m-0 p-3 text-sm text-ink-muted">Loading connections…</p>
  }

  if (hasUnfilteredConnections && filterText.trim() && state.connections.length === 0) {
    return (
      <div className="rounded-icebear-lg border border-dashed border-border bg-surface-muted p-4 text-center">
        <p className="m-0 text-sm font-medium text-ink">No matching connections</p>
        <p className="m-0 mt-1 text-xs leading-normal text-ink-muted">No connections or loaded buckets match “{filterText.trim()}”.</p>
      </div>
    )
  }

  if (state.connections.length === 0) {
    return (
      <div className="rounded-icebear-lg border border-dashed border-border-strong bg-surface-muted p-4 text-center">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-icebear-md bg-accent-soft text-accent">☁</div>
        <p className="m-0 text-sm font-medium text-ink">No saved connections</p>
        <p className="m-0 mt-1 text-xs leading-normal text-ink-muted">
          Add an S3, R2, MinIO, or S3-compatible connection to start browsing buckets.
        </p>
        <div className="mt-4">
          <Button variant="primary" onClick={onOpenConnectionModal}>
            Add connection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-1">
      {state.connections.map((connection) => (
        <ConnectionTreeItem
          key={connection.id}
          connection={connection}
          buckets={state.bucketsByConnectionId[connection.id] ?? []}
          selection={state.selection}
          isLoadingBuckets={state.loadingBucketConnectionIds.includes(connection.id)}
          error={state.errorsByNodeId[connection.id]}
          onSelectConnection={onSelectConnection}
          onSelectBucket={onSelectBucket}
        />
      ))}
    </ul>
  )
}
