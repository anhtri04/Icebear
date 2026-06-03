export type BadgeVariant = 'primary' | 'neutral'

interface BadgeProps {
  readonly children: string
  readonly variant?: BadgeVariant
}

export function Badge({ children, variant = 'neutral' }: BadgeProps): string {
  const variantClass =
    variant === 'primary'
      ? 'border-border bg-primary-soft text-primary'
      : 'border-border bg-surface-raised text-ink-muted'

  return `
    <span class="rounded-full border px-2.5 py-1 text-xs font-medium ${variantClass}">
      ${children}
    </span>
  `
}
