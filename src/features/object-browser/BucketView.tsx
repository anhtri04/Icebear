import type { ListObjectsResult } from '../../../electron/services/storage/storageService'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { ObjectTable } from './ObjectTable'

interface BucketViewProps {
  readonly bucket: string
  readonly result?: ListObjectsResult
  readonly isLoading: boolean
  readonly error?: string
  readonly onRefreshObjects: () => void
}

export function BucketView({ bucket, result, isLoading, error, onRefreshObjects }: BucketViewProps) {
  return (
    <Panel className="p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Bucket browser</p>
          <h2 className="m-0 mt-2 text-xl font-semibold text-ink">{bucket}</h2>
        </div>
        <Button onClick={onRefreshObjects}>Refresh objects</Button>
      </div>
      {isLoading ? <p className="rounded-icebear-lg bg-primary-soft p-4 text-sm text-primary">Loading objects…</p> : null}
      {error ? <p className="rounded-icebear-lg bg-danger-soft p-4 text-sm text-danger">{error}</p> : null}
      {!isLoading && !error ? <ObjectTable result={result} /> : null}
    </Panel>
  )
}
