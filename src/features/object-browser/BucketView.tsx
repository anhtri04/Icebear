import type { ListObjectsResult } from '../../../electron/services/storage/storageService'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { ObjectTable } from './ObjectTable'

interface BucketViewProps {
  readonly bucket: string
  readonly result?: ListObjectsResult
  readonly isLoading: boolean
  readonly error?: string
}

export function BucketView({ bucket, result, isLoading, error }: BucketViewProps): string {
  return Panel({
    className: 'p-6',
    children: `
      <div class="mb-5 flex items-center justify-between gap-4">
        <div>
          <p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Bucket browser</p>
          <h2 class="m-0 mt-2 text-xl font-semibold text-ink">${bucket}</h2>
        </div>
        ${Button({ children: 'Refresh objects', dataAction: 'refresh-selected-objects' })}
      </div>
      ${isLoading ? '<p class="rounded-icebear-lg bg-primary-soft p-4 text-sm text-primary">Loading objects…</p>' : ''}
      ${error ? `<p class="rounded-icebear-lg bg-danger-soft p-4 text-sm text-danger">${error}</p>` : ''}
      ${!isLoading && !error ? ObjectTable({ result }) : ''}
    `,
  })
}
