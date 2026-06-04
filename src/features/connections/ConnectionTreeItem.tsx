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
}

export function ConnectionTreeItem({ connection, buckets, selection, isLoadingBuckets, error }: ConnectionTreeItemProps): string {
  const isSelected = selection.type === 'connection' && selection.connectionId === connection.id
  const selectedClass = isSelected ? 'bg-selected text-ink ring-1 ring-selected-border' : 'text-ink-muted hover:bg-selected hover:text-ink'
  const bucketItems = buckets
    .map((bucket) => {
      const bucketSelected = selection.type === 'bucket' && selection.connectionId === connection.id && selection.bucket === bucket.name
      const bucketSelectedClass = bucketSelected ? 'bg-selected text-ink ring-1 ring-selected-border' : 'text-ink-muted hover:bg-selected hover:text-ink'

      return `
        <li>
          <button class="flex h-[var(--nav-item-height)] w-full items-center gap-2 rounded-icebear-sm pl-7 pr-2 text-left text-sm transition ${bucketSelectedClass}" type="button" data-bucket-name="${bucket.name}" data-connection-id="${connection.id}">
            <span class="w-4 text-center text-ink-subtle">▣</span>
            <span class="min-w-0 flex-1 truncate">${bucket.name}</span>
          </button>
        </li>
      `
    })
    .join('')

  return `
    <li>
      <button class="flex h-[var(--nav-item-height)] w-full items-center gap-2 rounded-icebear-sm px-2 text-left text-sm transition ${selectedClass}" type="button" data-connection-id="${connection.id}">
        <span class="w-4 text-center text-ink-subtle">☁</span>
        <span class="min-w-0 flex-1 truncate">${connection.name}</span>
        ${Badge({ children: formatProvider(connection.provider), variant: 'primary' })}
      </button>
      ${isLoadingBuckets ? '<p class="m-0 px-7 py-2 text-xs text-ink-subtle">Loading buckets…</p>' : ''}
      ${error ? `<p class="m-0 px-7 py-2 text-xs text-danger">${error}</p>` : ''}
      ${bucketItems ? `<ul class="mt-1 space-y-1">${bucketItems}</ul>` : ''}
    </li>
  `
}
