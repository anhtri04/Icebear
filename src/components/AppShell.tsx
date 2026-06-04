import { Badge } from './Badge'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'
import type { SaveObjectStorageConnectionInput } from '../../electron/services/credentials/credentialService'
import type { AppState } from '../appTypes'
import { objectListNodeId } from '../appTypes'
import { ConnectionFormModal } from '../features/connections/ConnectionFormModal'
import { ConnectionsSidebar } from '../features/connections/ConnectionsSidebar'
import { formatProvider, storageProviderLabels } from '../features/connections/connectionTypes'
import { BucketView } from '../features/object-browser/BucketView'

interface AppShellProps {
  readonly state: AppState
  readonly onOpenConnectionModal: () => void
  readonly onCloseConnectionModal: () => void
  readonly onRefreshConnections: () => void
  readonly onDeleteSelectedConnection: () => void
  readonly onRefreshSelectedBuckets: () => void
  readonly onRefreshSelectedObjects: () => void
  readonly onSelectConnection: (connectionId: string) => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
  readonly onSelectPrefix: (connectionId: string, bucket: string, prefix: string) => void
  readonly onSaveConnection: (input: SaveObjectStorageConnectionInput) => void
  readonly onTestConnection: (input: SaveObjectStorageConnectionInput) => void
}

export function AppShell(props: AppShellProps) {
  const { state } = props

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="grid min-h-screen grid-rows-[var(--layout-header-height)_minmax(0,1fr)]">
        <AppHeader state={state} />

        <div className="grid min-h-0 grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_320px] max-xl:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_0px]">
          <ConnectionsSidebar
            state={state}
            onOpenConnectionModal={props.onOpenConnectionModal}
            onRefreshConnections={props.onRefreshConnections}
            onDeleteSelectedConnection={props.onDeleteSelectedConnection}
            onSelectConnection={props.onSelectConnection}
            onSelectBucket={props.onSelectBucket}
          />
          <MainView
            state={state}
            onOpenConnectionModal={props.onOpenConnectionModal}
            onRefreshSelectedBuckets={props.onRefreshSelectedBuckets}
            onRefreshSelectedObjects={props.onRefreshSelectedObjects}
            onSelectBucket={props.onSelectBucket}
            onSelectPrefix={props.onSelectPrefix}
          />
          <aside className="min-h-0 border-l border-border bg-surface max-xl:hidden" aria-label="Options" />
        </div>
      </div>
      {state.isConnectionModalOpen ? (
        <ConnectionFormModal
          statusMessage={state.statusMessage}
          onClose={props.onCloseConnectionModal}
          onSave={props.onSaveConnection}
          onTest={props.onTestConnection}
        />
      ) : null}
    </div>
  )
}

interface AppHeaderProps {
  readonly state: AppState
}

function AppHeader({ state }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-5 shadow-icebear-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-icebear-md bg-primary text-sm font-semibold text-white shadow-icebear-sm">IB</div>
        <div>
          <h1 className="m-0 text-lg font-semibold leading-tight text-ink">Icebear</h1>
          <p className="m-0 text-xs leading-tight text-ink-muted">Object Storage Explorer</p>
        </div>
      </div>

      <div className="hidden min-w-0 items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink-muted md:flex">
        <span className="size-2 rounded-full bg-accent" />
        <span className="truncate">{resolveContextLabel(state)}</span>
      </div>

      <div className="flex items-center gap-2">
        {storageProviderLabels.map((label) => (
          <Badge key={label} variant="primary">
            {label}
          </Badge>
        ))}
      </div>
    </header>
  )
}

interface MainViewProps {
  readonly state: AppState
  readonly onOpenConnectionModal: () => void
  readonly onRefreshSelectedBuckets: () => void
  readonly onRefreshSelectedObjects: () => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
  readonly onSelectPrefix: (connectionId: string, bucket: string, prefix: string) => void
}

function MainView({ state, onOpenConnectionModal, onRefreshSelectedBuckets, onRefreshSelectedObjects, onSelectBucket, onSelectPrefix }: MainViewProps) {
  const { selection } = state

  if (selection.type === 'connection') {
    const connection = state.connections.find((item) => item.id === selection.connectionId)
    if (connection) {
      return <ConnectionDetail state={state} connectionId={connection.id} onRefreshSelectedBuckets={onRefreshSelectedBuckets} onSelectBucket={onSelectBucket} />
    }
  }

  if (selection.type === 'bucket') {
    const prefix = selection.prefix ?? ''
    const id = objectListNodeId(selection.connectionId, selection.bucket, prefix)
    return (
      <main className="min-h-0 overflow-auto bg-canvas p-6">
        <BucketView
          bucket={selection.bucket}
          prefix={prefix}
          result={state.objectsByBucketId[id]}
          isLoading={state.loadingObjectBucketIds.includes(id)}
          error={state.errorsByNodeId[id]}
          onRefreshObjects={onRefreshSelectedObjects}
          onOpenPrefix={(nextPrefix) => onSelectPrefix(selection.connectionId, selection.bucket, nextPrefix)}
        />
      </main>
    )
  }

  return <WelcomeView onOpenConnectionModal={onOpenConnectionModal} />
}

interface WelcomeViewProps {
  readonly onOpenConnectionModal: () => void
}

function WelcomeView({ onOpenConnectionModal }: WelcomeViewProps) {
  const providerBadges = [
    ...storageProviderLabels.map((label) => <Badge key={label}>{label}</Badge>),
    <Badge key="generic-s3">Generic S3</Badge>,
  ]

  return (
    <main className="min-h-0 overflow-auto bg-canvas p-6">
      <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
        <Panel className="w-full p-8">
          <EmptyState
            icon="⬣"
            eyebrow="Icebear workspace"
            title="Connect to Object Storage"
            description="Browse buckets, inspect objects, and prepare datasets from Amazon S3, Cloudflare R2, MinIO, and other S3-compatible providers."
          />
          <div className="mt-6 flex flex-wrap justify-center gap-2">{providerBadges}</div>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="primary" onClick={onOpenConnectionModal}>
              Add connection
            </Button>
            <Button>Learn workflow</Button>
          </div>
        </Panel>
      </div>
    </main>
  )
}

interface ConnectionDetailProps {
  readonly state: AppState
  readonly connectionId: string
  readonly onRefreshSelectedBuckets: () => void
  readonly onSelectBucket: (connectionId: string, bucket: string) => void
}

function ConnectionDetail({ state, connectionId, onRefreshSelectedBuckets, onSelectBucket }: ConnectionDetailProps) {
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

function resolveContextLabel(state: AppState): string {
  const { selection } = state

  if (selection.type === 'connection') {
    return state.connections.find((item) => item.id === selection.connectionId)?.name ?? 'No connection selected'
  }

  if (selection.type === 'bucket') {
    const connection = state.connections.find((item) => item.id === selection.connectionId)
    const prefix = selection.prefix ? ` / ${selection.prefix}` : ''
    return `${connection?.name ?? 'Connection'} / ${selection.bucket}${prefix}`
  }

  return 'No connection selected'
}
