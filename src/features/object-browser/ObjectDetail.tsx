import type { ObjectMetadata } from '../../../shared/storageTypes'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'

interface ObjectDetailProps {
  readonly bucket: string
  readonly objectKey: string
  readonly prefix: string
  readonly metadata?: ObjectMetadata
  readonly isLoading: boolean
  readonly error?: string
  readonly onBack: () => void
  readonly onRefreshMetadata: () => void
}

export function ObjectDetail({ bucket, objectKey, prefix, metadata, isLoading, error, onBack, onRefreshMetadata }: ObjectDetailProps) {
  return (
    <Panel className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Object detail</p>
          <h2 className="m-0 mt-2 truncate text-xl font-semibold text-ink">{displayObjectName(objectKey, prefix)}</h2>
          <p className="m-0 mt-2 break-all text-sm text-ink-muted">{objectKey}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={onBack}>Back to objects</Button>
          <Button onClick={onRefreshMetadata}>Refresh metadata</Button>
        </div>
      </div>

      {isLoading ? <p className="rounded-icebear-lg bg-primary-soft p-4 text-sm text-primary">Loading object metadata…</p> : null}
      {error ? <p className="rounded-icebear-lg bg-danger-soft p-4 text-sm text-danger">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard label="Bucket" value={bucket} />
            <DetailCard label="Size" value={metadata?.size === undefined ? '—' : `${metadata.size.toLocaleString()} B`} />
            <DetailCard label="Content type" value={metadata?.contentType ?? '—'} />
            <DetailCard label="Last modified" value={metadata?.lastModified ?? '—'} />
          </div>

          <section className="rounded-icebear-lg border border-border bg-surface-raised p-4">
            <h3 className="m-0 text-sm font-semibold text-ink">Object metadata</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <MetadataRow label="Key" value={objectKey} />
              <MetadataRow label="ETag" value={metadata?.etag ?? '—'} />
            </dl>
          </section>

          <section className="rounded-icebear-lg border border-border bg-surface-raised p-4">
            <h3 className="m-0 text-sm font-semibold text-ink">User metadata</h3>
            <UserMetadata metadata={metadata?.metadata ?? {}} />
          </section>
        </div>
      ) : null}
    </Panel>
  )
}

interface DetailCardProps {
  readonly label: string
  readonly value: string
}

function DetailCard({ label, value }: DetailCardProps) {
  return (
    <div className="rounded-icebear-lg border border-border bg-surface p-3">
      <p className="m-0 text-xs text-ink-subtle">{label}</p>
      <p className="m-0 mt-1 truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

interface MetadataRowProps {
  readonly label: string
  readonly value: string
}

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <div className="grid gap-1 md:grid-cols-[140px_minmax(0,1fr)]">
      <dt className="text-ink-subtle">{label}</dt>
      <dd className="m-0 break-all text-ink">{value}</dd>
    </div>
  )
}

interface UserMetadataProps {
  readonly metadata: Record<string, string>
}

function UserMetadata({ metadata }: UserMetadataProps) {
  const entries = Object.entries(metadata)

  if (entries.length === 0) {
    return <p className="m-0 mt-3 text-sm text-ink-muted">No user metadata found for this object.</p>
  }

  return (
    <dl className="mt-4 grid gap-3 text-sm">
      {entries.map(([key, value]) => (
        <MetadataRow key={key} label={key} value={value} />
      ))}
    </dl>
  )
}

function displayObjectName(objectKey: string, prefix: string): string {
  return prefix && objectKey.startsWith(prefix) ? objectKey.slice(prefix.length) : objectKey
}
