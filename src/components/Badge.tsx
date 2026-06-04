import type { ReactNode } from 'react'

export type BadgeVariant = 'primary' | 'neutral'

interface BadgeProps {
  readonly children: ReactNode
  readonly variant?: BadgeVariant
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const variantClass =
    variant === 'primary'
      ? 'border-border bg-primary-soft text-primary'
      : 'border-border bg-surface-raised text-ink-muted'

  return <span className={`rounded-sm border px-2.5 py-1 text-xs font-medium ${variantClass}`}>{children}</span>
}
