import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import type { AppState } from '../../appTypes'
import { formatProvider } from './connectionTypes'
import { WelcomeView } from '../workspace/WelcomeView'

interface ConnectionDetailProps {
  readonly state: AppState
  readonly connectionId: string
  readonly onRefreshSelectedBuckets: () => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
}

export function ConnectionDetail({ state, connectionId, onRefreshSelectedBuckets, onSelectBucket }: ConnectionDetailProps) {
  const connection = state.connections.find((item) => item.id === connectionId)
  if (!connection) {
    return <WelcomeView onOpenConnectionModal={() => undefined} />
  }

  const buckets = state.bucketsByConnectionId[connectionId] ?? []

  return (
    <main className="min-h-0 overflow-auto bg-canvas p-6">
      <Panel className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Connection</p>
            <h2 className="m-0 mt-2 text-2xl font-semibold text-ink">{connection.name}</h2>
            <p className="m-0 mt-1 text-sm text-ink-muted">{connection.endpoint ?? connection.region ?? 'Default AWS endpoint'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">{formatProvider(connection.provider)}</Badge>
            <Button onClick={onRefreshSelectedBuckets}>Refresh buckets</Button>
          </div>
        </div>
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <DetailCard label="Provider" value={formatProvider(connection.provider)} />
          <DetailCard label="Region" value={connection.region ?? '—'} />
          <DetailCard label="Access key" value={connection.accessKeyId ? 'Saved' : 'Not configured'} />
          <DetailCard label="Secret" value={connection.hasSecretAccessKey ? 'Saved' : 'Not configured'} />
        </div>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.1em] text-ink-subtle">
            <tr>
              <th className="pb-2">Bucket</th>
              <th className="pb-2">Created</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {buckets.length > 0 ? (
              buckets.map((bucket) => (
                <tr key={bucket.name} className="border-t border-border">
                  <td className="py-3 text-ink">{bucket.name}</td>
                  <td className="py-3 text-ink-muted">{bucket.createdAt ?? '—'}</td>
                  <td className="py-3 text-right">
                    <button className="text-sm font-semibold text-primary hover:text-primary-hover" type="button" onClick={() => onSelectBucket(connectionId, bucket.name)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-border">
                <td className="py-6 text-center text-sm text-ink-muted" colSpan={3}>
                  No buckets loaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </main>
  )
}

interface DetailCardProps {
  readonly label: string
  readonly value: string
}

function DetailCard({ label, value }: DetailCardProps) {
  return (
    <div className="rounded-icebear-lg border border-border bg-surface-raised p-3">
      <p className="m-0 text-xs text-ink-subtle">{label}</p>
      <p className="m-0 mt-1 truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}
