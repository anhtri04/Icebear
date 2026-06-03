import { Badge } from '../../components/Badge'
import type { ConnectionTreeNode } from './connectionTypes'

interface ConnectionTreeItemProps {
  readonly node: ConnectionTreeNode
  readonly depth?: number
}

const nodeIcons: Record<ConnectionTreeNode['kind'], string> = {
  connection: '☁',
  bucket: '▣',
  prefix: '▸',
  object: '◇',
}

export function ConnectionTreeItem({ node, depth = 0 }: ConnectionTreeItemProps): string {
  const children = node.children?.map((child) => ConnectionTreeItem({ node: child, depth: depth + 1 })).join('') ?? ''
  const paddingLeft = 0.75 + depth * 1

  return `
    <li>
      <button class="flex h-[var(--nav-item-height)] w-full items-center gap-2 rounded-icebear-sm pr-2 text-left text-sm text-ink-muted transition hover:bg-selected hover:text-ink" style="padding-left: ${paddingLeft}rem" type="button">
        <span class="w-4 text-center text-ink-subtle">${nodeIcons[node.kind]}</span>
        <span class="min-w-0 flex-1 truncate">${node.name}</span>
        ${node.provider ? Badge({ children: node.provider, variant: 'primary' }) : ''}
      </button>
      ${children ? `<ul class="mt-1 space-y-1">${children}</ul>` : ''}
    </li>
  `
}
