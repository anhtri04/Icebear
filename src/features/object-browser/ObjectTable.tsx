import type { ObjectTableRow } from './objectBrowserTypes'

interface ObjectTableProps {
  readonly rows?: ObjectTableRow[]
}

export function ObjectTable({ rows = [] }: ObjectTableProps): string {
  if (rows.length === 0) {
    return `
      <div class="rounded-icebear-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-ink-muted">
        Select a bucket to list prefixes and objects.
      </div>
    `
  }

  return `
    <table class="w-full border-collapse text-left text-sm">
      <thead class="text-xs uppercase tracking-[0.1em] text-ink-subtle">
        <tr><th>Name</th><th>Type</th><th>Size</th><th>Last modified</th></tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr class="border-t border-border">
                <td class="py-2 text-ink">${row.name}</td>
                <td class="py-2 text-ink-muted">${row.type}</td>
                <td class="py-2 text-ink-muted">${row.size ?? '—'}</td>
                <td class="py-2 text-ink-muted">${row.lastModified ?? '—'}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `
}
