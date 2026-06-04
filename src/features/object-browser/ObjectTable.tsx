import type { ListObjectsResult } from '../../../electron/services/storage/storageService'

interface ObjectTableProps {
  readonly result?: ListObjectsResult
}

export function ObjectTable({ result }: ObjectTableProps): string {
  const prefixes = result?.prefixes ?? []
  const objects = result?.objects ?? []

  if (prefixes.length === 0 && objects.length === 0) {
    return `
      <div class="rounded-icebear-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-ink-muted">
        This bucket has no objects at the current prefix.
      </div>
    `
  }

  return `
    <table class="w-full border-collapse text-left text-sm">
      <thead class="text-xs uppercase tracking-[0.1em] text-ink-subtle">
        <tr><th class="pb-2">Name</th><th class="pb-2">Type</th><th class="pb-2">Size</th><th class="pb-2">Last modified</th></tr>
      </thead>
      <tbody>
        ${prefixes.map((prefix) => Row({ name: prefix, type: 'Prefix', size: '—', lastModified: '—' })).join('')}
        ${objects
          .map((object) =>
            Row({
              name: object.key,
              type: 'Object',
              size: object.size === undefined ? '—' : `${object.size.toLocaleString()} B`,
              lastModified: object.lastModified ?? '—',
            }),
          )
          .join('')}
      </tbody>
    </table>
  `
}

interface RowProps {
  readonly name: string
  readonly type: string
  readonly size: string
  readonly lastModified: string
}

function Row({ name, type, size, lastModified }: RowProps): string {
  return `
    <tr class="border-t border-border">
      <td class="max-w-xl truncate py-3 text-ink">${name}</td>
      <td class="py-3 text-ink-muted">${type}</td>
      <td class="py-3 text-ink-muted">${size}</td>
      <td class="py-3 text-ink-muted">${lastModified}</td>
    </tr>
  `
}
