import type { ListObjectsResult } from '../../../electron/services/storage/storageService'

interface ObjectTableProps {
  readonly result?: ListObjectsResult
}

export function ObjectTable({ result }: ObjectTableProps) {
  const prefixes = result?.prefixes ?? []
  const objects = result?.objects ?? []

  if (prefixes.length === 0 && objects.length === 0) {
    return (
      <div className="rounded-icebear-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-ink-muted">
        This bucket has no objects at the current prefix.
      </div>
    )
  }

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead className="text-xs uppercase tracking-[0.1em] text-ink-subtle">
        <tr>
          <th className="pb-2">Name</th>
          <th className="pb-2">Type</th>
          <th className="pb-2">Size</th>
          <th className="pb-2">Last modified</th>
        </tr>
      </thead>
      <tbody>
        {prefixes.map((prefix) => (
          <Row key={`prefix-${prefix}`} name={prefix} type="Prefix" size="—" lastModified="—" />
        ))}
        {objects.map((object) => (
          <Row
            key={`object-${object.key}`}
            name={object.key}
            type="Object"
            size={object.size === undefined ? '—' : `${object.size.toLocaleString()} B`}
            lastModified={object.lastModified ?? '—'}
          />
        ))}
      </tbody>
    </table>
  )
}

interface RowProps {
  readonly name: string
  readonly type: string
  readonly size: string
  readonly lastModified: string
}

function Row({ name, type, size, lastModified }: RowProps) {
  return (
    <tr className="border-t border-border">
      <td className="max-w-xl truncate py-3 text-ink">{name}</td>
      <td className="py-3 text-ink-muted">{type}</td>
      <td className="py-3 text-ink-muted">{size}</td>
      <td className="py-3 text-ink-muted">{lastModified}</td>
    </tr>
  )
}
