import type { ListObjectsResult } from '../../../shared/storageTypes'

interface ObjectTableProps {
  readonly result?: ListObjectsResult
  readonly currentPrefix: string
  readonly onOpenPrefix: (prefix: string) => void
  readonly onSelectObject: (key: string) => void
}

export function ObjectTable({ result, currentPrefix, onOpenPrefix, onSelectObject }: ObjectTableProps) {
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
          <Row
            key={`prefix-${prefix}`}
            name={formatPrefixName(prefix, currentPrefix)}
            type="Prefix"
            size="—"
            lastModified="—"
            onOpen={() => onOpenPrefix(prefix)}
          />
        ))}
        {objects.map((object) => (
          <Row
            key={`object-${object.key}`}
            name={formatObjectName(object.key, currentPrefix)}
            type="Object"
            size={object.size === undefined ? '—' : `${object.size.toLocaleString()} B`}
            lastModified={object.lastModified ?? '—'}
            onOpen={() => onSelectObject(object.key)}
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
  readonly onOpen?: () => void
}

function Row({ name, type, size, lastModified, onOpen }: RowProps) {
  const nameContent = onOpen ? (
    <button className="max-w-full truncate text-left font-medium text-primary hover:text-primary-hover" type="button" onClick={onOpen}>
      <span className="mr-2" aria-hidden="true">
        {type === 'Prefix' ? '▸' : '◻'}
      </span>
      {name}
    </button>
  ) : (
    <span>{name}</span>
  )

  return (
    <tr className="border-t border-border">
      <td className="max-w-xl truncate py-3 text-ink">{nameContent}</td>
      <td className="py-3 text-ink-muted">{type}</td>
      <td className="py-3 text-ink-muted">{size}</td>
      <td className="py-3 text-ink-muted">{lastModified}</td>
    </tr>
  )
}

function formatPrefixName(prefix: string, currentPrefix: string): string {
  const relative = stripCurrentPrefix(prefix, currentPrefix)
  return relative || prefix
}

function formatObjectName(key: string, currentPrefix: string): string {
  const relative = stripCurrentPrefix(key, currentPrefix)
  return relative || key
}

function stripCurrentPrefix(value: string, currentPrefix: string): string {
  return currentPrefix && value.startsWith(currentPrefix) ? value.slice(currentPrefix.length) : value
}
