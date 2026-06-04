import type { ListObjectsResult } from '../../../electron/services/storage/storageService'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { ObjectTable } from './ObjectTable'

interface BucketViewProps {
  readonly bucket: string
  readonly prefix: string
  readonly result?: ListObjectsResult
  readonly isLoading: boolean
  readonly error?: string
  readonly onRefreshObjects: () => void
  readonly onOpenPrefix: (prefix: string) => void
}

export function BucketView({ bucket, prefix, result, isLoading, error, onRefreshObjects, onOpenPrefix }: BucketViewProps) {
  const parentPrefix = getParentPrefix(prefix)

  return (
    <Panel className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Bucket browser</p>
          <h2 className="m-0 mt-2 truncate text-xl font-semibold text-ink">{bucket}</h2>
          <PrefixBreadcrumb bucket={bucket} prefix={prefix} onOpenPrefix={onOpenPrefix} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {prefix ? <Button onClick={() => onOpenPrefix(parentPrefix)}>Up</Button> : null}
          <Button onClick={onRefreshObjects}>Refresh objects</Button>
        </div>
      </div>
      {isLoading ? <p className="rounded-icebear-lg bg-primary-soft p-4 text-sm text-primary">Loading objects…</p> : null}
      {error ? <p className="rounded-icebear-lg bg-danger-soft p-4 text-sm text-danger">{error}</p> : null}
      {!isLoading && !error ? <ObjectTable currentPrefix={prefix} result={result} onOpenPrefix={onOpenPrefix} /> : null}
    </Panel>
  )
}

interface PrefixBreadcrumbProps {
  readonly bucket: string
  readonly prefix: string
  readonly onOpenPrefix: (prefix: string) => void
}

function PrefixBreadcrumb({ bucket, prefix, onOpenPrefix }: PrefixBreadcrumbProps) {
  const segments = getPrefixSegments(prefix)

  return (
    <nav className="mt-3 flex flex-wrap items-center gap-1 text-sm text-ink-muted" aria-label="Current prefix">
      <button className="font-medium text-primary hover:text-primary-hover" type="button" onClick={() => onOpenPrefix('')}>
        {bucket}
      </button>
      {segments.map((segment) => (
        <span key={segment.prefix} className="flex min-w-0 items-center gap-1">
          <span className="text-ink-subtle">/</span>
          <button className="max-w-48 truncate text-primary hover:text-primary-hover" type="button" onClick={() => onOpenPrefix(segment.prefix)}>
            {segment.name}
          </button>
        </span>
      ))}
    </nav>
  )
}

function getPrefixSegments(prefix: string): Array<{ name: string; prefix: string }> {
  const parts = prefix.split('/').filter(Boolean)
  return parts.map((name, index) => ({
    name,
    prefix: `${parts.slice(0, index + 1).join('/')}/`,
  }))
}

function getParentPrefix(prefix: string): string {
  const parts = prefix.split('/').filter(Boolean)
  return parts.length <= 1 ? '' : `${parts.slice(0, -1).join('/')}/`
}
