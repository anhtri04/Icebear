import type { ReactNode } from 'react'

interface PanelProps {
  readonly children: ReactNode
  readonly className?: string
}

export function Panel({ children, className = '' }: PanelProps) {
  return <section className={`rounded-icebear-xl border border-border bg-surface shadow-icebear-md ${className}`}>{children}</section>
}
