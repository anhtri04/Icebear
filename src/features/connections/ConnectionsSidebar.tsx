import type { AppState } from '../../appTypes'
import { ConnectionsToolbar } from './ConnectionsToolbar'
import { ConnectionTree } from './ConnectionTree'

interface ConnectionsSidebarProps {
  readonly state: AppState
}

export function ConnectionsSidebar({ state }: ConnectionsSidebarProps): string {
  const canRemove = state.selection.type === 'connection' || state.selection.type === 'bucket'

  return `
    <aside class="flex min-h-0 flex-col border-r border-border bg-surface-raised">
      <div class="border-b border-border p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 class="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted">Connections</h2>
            <p class="m-0 mt-1 text-xs text-ink-subtle">Saved object storage profiles</p>
          </div>
          ${ConnectionsToolbar({ canRemove })}
        </div>

        <label class="block">
          <span class="sr-only">Filter connections</span>
          <input
            class="h-[var(--input-height)] w-full rounded-icebear-md border border-border bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary"
            type="search"
            placeholder="Filter connections, buckets, prefixes..."
          />
        </label>
      </div>

      <nav class="min-h-0 flex-1 overflow-auto p-3" aria-label="Connection tree">
        ${ConnectionTree({ state })}
      </nav>
    </aside>
  `
}
