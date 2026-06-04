import { Badge } from './Badge'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'
import type { AppState } from '../appTypes'
import { bucketNodeId } from '../appTypes'
import { ConnectionFormModal } from '../features/connections/ConnectionFormModal'
import { ConnectionsSidebar } from '../features/connections/ConnectionsSidebar'
import { formatProvider, storageProviderLabels } from '../features/connections/connectionTypes'
import { BucketView } from '../features/object-browser/BucketView'

interface AppShellProps {
  readonly state: AppState
}

export function AppShell({ state }: AppShellProps): string {
  return `
    <div class="min-h-screen bg-canvas text-ink">
      <div class="grid min-h-screen grid-rows-[var(--layout-header-height)_minmax(0,1fr)]">
        ${AppHeader({ state })}

        <div class="grid min-h-0 grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_320px] max-xl:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_0px]">
          ${ConnectionsSidebar({ state })}
          ${MainView({ state })}
          <aside class="min-h-0 border-l border-border bg-surface max-xl:hidden" aria-label="Options"></aside>
        </div>
      </div>
      ${state.isConnectionModalOpen ? ConnectionFormModal({ statusMessage: state.statusMessage }) : ''}
    </div>
  `
}

function AppHeader({ state }: AppShellProps): string {
  return `
    <header class="flex items-center justify-between border-b border-border bg-surface px-5 shadow-icebear-sm">
      <div class="flex items-center gap-3">
        <div class="grid size-9 place-items-center rounded-icebear-md bg-primary text-sm font-semibold text-white shadow-icebear-sm">
          IB
        </div>
        <div>
          <h1 class="m-0 text-lg font-semibold leading-tight text-ink">Icebear</h1>
          <p class="m-0 text-xs leading-tight text-ink-muted">Object Storage Explorer</p>
        </div>
      </div>

      <div class="hidden min-w-0 items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink-muted md:flex">
        <span class="size-2 rounded-full bg-accent"></span>
        <span class="truncate">${resolveContextLabel(state)}</span>
      </div>

      <div class="flex items-center gap-2">
        ${storageProviderLabels.map((label) => Badge({ children: label, variant: 'primary' })).join('')}
      </div>
    </header>
  `
}

function MainView({ state }: AppShellProps): string {
  const { selection } = state

  if (selection.type === 'connection') {
    const connection = state.connections.find((item) => item.id === selection.connectionId)
    if (connection) {
      return ConnectionDetail({ state, connectionId: connection.id })
    }
  }

  if (selection.type === 'bucket') {
    const id = bucketNodeId(selection.connectionId, selection.bucket)
    return `
      <main class="min-h-0 overflow-auto bg-canvas p-6">
        ${BucketView({
          bucket: selection.bucket,
          result: state.objectsByBucketId[id],
          isLoading: state.loadingObjectBucketIds.includes(id),
          error: state.errorsByNodeId[id],
        })}
      </main>
    `
  }

  return WelcomeView()
}

function WelcomeView(): string {
  const providerBadges = [
    ...storageProviderLabels.map((label) => Badge({ children: label })),
    Badge({ children: 'Generic S3' }),
  ].join('')

  return `
    <main class="min-h-0 overflow-auto bg-canvas p-6">
      <div class="mx-auto flex min-h-full max-w-5xl items-center justify-center">
        ${Panel({
          className: 'w-full p-8',
          children: `
            ${EmptyState({
              icon: '⬣',
              eyebrow: 'Icebear workspace',
              title: 'Connect to Object Storage',
              description:
                'Browse buckets, inspect objects, and prepare datasets from Amazon S3, Cloudflare R2, MinIO, and other S3-compatible providers.',
            })}
            <div class="mt-6 flex flex-wrap justify-center gap-2">${providerBadges}</div>
            <div class="mt-8 flex justify-center gap-3">
              ${Button({ children: 'Add connection', variant: 'primary', dataAction: 'open-connection-modal' })}
              ${Button({ children: 'Learn workflow' })}
            </div>
          `,
        })}
      </div>
    </main>
  `
}

interface ConnectionDetailProps {
  readonly state: AppState
  readonly connectionId: string
}

function ConnectionDetail({ state, connectionId }: ConnectionDetailProps): string {
  const connection = state.connections.find((item) => item.id === connectionId)
  if (!connection) {
    return WelcomeView()
  }

  const buckets = state.bucketsByConnectionId[connectionId] ?? []
  const bucketRows = buckets.length
    ? buckets
        .map(
          (bucket) => `
            <tr class="border-t border-border">
              <td class="py-3 text-ink">${bucket.name}</td>
              <td class="py-3 text-ink-muted">${bucket.createdAt ?? '—'}</td>
              <td class="py-3 text-right"><button class="text-sm font-semibold text-primary hover:text-primary-hover" type="button" data-connection-id="${connectionId}" data-bucket-name="${bucket.name}">Open</button></td>
            </tr>
          `,
        )
        .join('')
    : '<tr class="border-t border-border"><td class="py-6 text-center text-sm text-ink-muted" colspan="3">No buckets loaded yet.</td></tr>'

  return `
    <main class="min-h-0 overflow-auto bg-canvas p-6">
      ${Panel({
        className: 'p-6',
        children: `
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Connection</p>
              <h2 class="m-0 mt-2 text-2xl font-semibold text-ink">${connection.name}</h2>
              <p class="m-0 mt-1 text-sm text-ink-muted">${connection.endpoint ?? connection.region ?? 'Default AWS endpoint'}</p>
            </div>
            <div class="flex items-center gap-2">
              ${Badge({ children: formatProvider(connection.provider), variant: 'primary' })}
              ${Button({ children: 'Refresh buckets', dataAction: 'refresh-selected-buckets' })}
            </div>
          </div>
          <div class="mb-6 grid gap-3 md:grid-cols-4">
            ${DetailCard('Provider', formatProvider(connection.provider))}
            ${DetailCard('Region', connection.region ?? '—')}
            ${DetailCard('Access key', connection.accessKeyId ? 'Saved' : 'Not configured')}
            ${DetailCard('Secret', connection.hasSecretAccessKey ? 'Saved' : 'Not configured')}
          </div>
          <table class="w-full border-collapse text-left text-sm">
            <thead class="text-xs uppercase tracking-[0.1em] text-ink-subtle">
              <tr><th class="pb-2">Bucket</th><th class="pb-2">Created</th><th class="pb-2 text-right">Action</th></tr>
            </thead>
            <tbody>${bucketRows}</tbody>
          </table>
        `,
      })}
    </main>
  `
}

function DetailCard(label: string, value: string): string {
  return `
    <div class="rounded-icebear-lg border border-border bg-surface-raised p-3">
      <p class="m-0 text-xs text-ink-subtle">${label}</p>
      <p class="m-0 mt-1 truncate text-sm font-semibold text-ink">${value}</p>
    </div>
  `
}

function resolveContextLabel(state: AppState): string {
  const { selection } = state

  if (selection.type === 'connection') {
    return state.connections.find((item) => item.id === selection.connectionId)?.name ?? 'No connection selected'
  }

  if (selection.type === 'bucket') {
    const connection = state.connections.find((item) => item.id === selection.connectionId)
    return `${connection?.name ?? 'Connection'} / ${selection.bucket}`
  }

  return 'No connection selected'
}
