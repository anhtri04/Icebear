import { Badge } from '../../components/Badge'
import type { RedactedObjectStorageConnection } from '../../../electron/services/credentials/credentialService'
import type { StorageBucket } from '../../../electron/services/storage/storageService'
import type { Selection } from '../../appTypes'
import { formatProvider } from './connectionTypes'

interface ConnectionTreeItemProps {
  readonly connection: RedactedObjectStorageConnection
  readonly buckets: readonly StorageBucket[]
  readonly selection: Selection
  readonly isLoadingBuckets: boolean
  readonly error?: string
  readonly onSelectConnection: (connectionId: string) => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
}

export function ConnectionTreeItem({
  connection,
  buckets,
  selection,
  isLoadingBuckets,
  error,
  onSelectConnection,
  onSelectBucket,
}: ConnectionTreeItemProps) {
  const isSelected = selection.type === 'connection' && selection.connectionId === connection.id
  const selectedClass = isSelected ? 'bg-selected text-ink ring-1 ring-selected-border' : 'text-ink-muted hover:bg-selected hover:text-ink'

  return (
    <li>
      <button
        className={`flex h-[var(--nav-item-height)] w-full items-center gap-2 rounded-icebear-sm px-2 text-left text-sm transition ${selectedClass}`}
        type="button"
        onClick={() => onSelectConnection(connection.id)}
      >
        <span className="w-4 text-center text-ink-subtle">☁</span>
        <span className="min-w-0 flex-1 truncate">{connection.name}</span>
        <Badge variant="primary">{formatProvider(connection.provider)}</Badge>
      </button>
      {isLoadingBuckets ? <p className="m-0 px-7 py-2 text-xs text-ink-subtle">Loading buckets…</p> : null}
      {error ? <p className="m-0 px-7 py-2 text-xs text-danger">{error}</p> : null}
      {buckets.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {buckets.map((bucket) => {
            const bucketSelected = selection.type === 'bucket' && selection.connectionId === connection.id && selection.bucket === bucket.name
            const bucketSelectedClass = bucketSelected
              ? 'bg-selected text-ink ring-1 ring-selected-border'
              : 'text-ink-muted hover:bg-selected hover:text-ink'

            return (
              <li key={bucket.name}>
                <button
                  className={`flex h-[var(--nav-item-height)] w-full items-center gap-2 rounded-icebear-sm pl-7 pr-2 text-left text-sm transition ${bucketSelectedClass}`}
                  type="button"
                  onClick={() => onSelectBucket(connection.id, bucket.name)}
                >
                  <span className="w-4 text-center text-ink-subtle">▣</span>
                  <span className="min-w-0 flex-1 truncate">{bucket.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </li>
  )
}
