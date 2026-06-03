import { Badge } from './Badge'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'
import { ConnectionsSidebar } from '../features/connections/ConnectionsSidebar'
import { storageProviderLabels } from '../features/connections/connectionTypes'

export function AppShell(): string {
  return `
    <div class="min-h-screen bg-canvas text-ink">
      <div class="grid min-h-screen grid-rows-[var(--layout-header-height)_minmax(0,1fr)]">
        ${AppHeader()}

        <div class="grid min-h-0 grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_320px] max-xl:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_0px]">
          ${ConnectionsSidebar()}
          ${MainWelcomeView()}
          <aside class="min-h-0 border-l border-border bg-surface max-xl:hidden" aria-label="Options"></aside>
        </div>
      </div>
    </div>
  `
}

function AppHeader(): string {
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
        <span class="truncate">No connection selected</span>
      </div>

      <div class="flex items-center gap-2">
        ${storageProviderLabels.map((label) => Badge({ children: label, variant: 'primary' })).join('')}
      </div>
    </header>
  `
}

function MainWelcomeView(): string {
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
                'Browse buckets, inspect objects, and prepare datasets from Amazon S3, Cloudflare R2, MinIO, and other S3-compatible providers. Connection wiring will be added next.',
            })}

            <div class="mt-6 flex flex-wrap justify-center gap-2">${providerBadges}</div>

            <div class="mt-8 flex justify-center gap-3">
              ${Button({ children: 'Add connection', variant: 'primary' })}
              ${Button({ children: 'Learn workflow' })}
            </div>
          `,
        })}
      </div>
    </main>
  `
}
