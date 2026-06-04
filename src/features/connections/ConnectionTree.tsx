import { Button } from '../../components/Button'
import type { AppState } from '../../appTypes'
import { ConnectionTreeItem } from './ConnectionTreeItem'

interface ConnectionTreeProps {
  readonly state: AppState
}

export function ConnectionTree({ state }: ConnectionTreeProps): string {
  if (state.isLoadingConnections) {
    return '<p class="m-0 p-3 text-sm text-ink-muted">Loading connections…</p>'
  }

  if (state.connections.length === 0) {
    return `
      <div class="rounded-icebear-lg border border-dashed border-border-strong bg-surface-muted p-4 text-center">
        <div class="mx-auto mb-3 grid size-10 place-items-center rounded-icebear-md bg-accent-soft text-accent">
          ☁
        </div>
        <p class="m-0 text-sm font-medium text-ink">No saved connections</p>
        <p class="m-0 mt-1 text-xs leading-normal text-ink-muted">
          Add an S3, R2, MinIO, or S3-compatible connection to start browsing buckets.
        </p>
        <div class="mt-4">${Button({ children: 'Add connection', variant: 'primary', dataAction: 'open-connection-modal' })}</div>
      </div>
    `
  }

  return `
    <ul class="space-y-1">
      ${state.connections
        .map((connection) =>
          ConnectionTreeItem({
            connection,
            buckets: state.bucketsByConnectionId[connection.id] ?? [],
            selection: state.selection,
            isLoadingBuckets: state.loadingBucketConnectionIds.includes(connection.id),
            error: state.errorsByNodeId[connection.id],
          }),
        )
        .join('')}
    </ul>
  `
}
