import { Button } from '../../components/Button'
import { ConnectionTreeItem } from './ConnectionTreeItem'
import type { ConnectionTreeNode } from './connectionTypes'

interface ConnectionTreeProps {
  readonly nodes?: ConnectionTreeNode[]
}

export function ConnectionTree({ nodes = [] }: ConnectionTreeProps): string {
  if (nodes.length === 0) {
    return `
      <div class="rounded-icebear-lg border border-dashed border-border-strong bg-surface-muted p-4 text-center">
        <div class="mx-auto mb-3 grid size-10 place-items-center rounded-icebear-md bg-accent-soft text-accent">
          ☁
        </div>
        <p class="m-0 text-sm font-medium text-ink">No saved connections</p>
        <p class="m-0 mt-1 text-xs leading-normal text-ink-muted">
          Add an S3, R2, MinIO, or S3-compatible connection to start browsing buckets.
        </p>
        <div class="mt-4">${Button({ children: 'Add connection', variant: 'primary' })}</div>
      </div>
    `
  }

  return `<ul class="space-y-1">${nodes.map((node) => ConnectionTreeItem({ node })).join('')}</ul>`
}
