export type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps {
  readonly children: string
  readonly variant?: ButtonVariant
  readonly disabled?: boolean
  readonly ariaLabel?: string
}

export function Button({ children, variant = 'secondary', disabled = false, ariaLabel }: ButtonProps): string {
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white shadow-icebear-sm hover:bg-primary-hover'
      : 'border border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink'

  const disabledAttribute = disabled ? ' disabled' : ''
  const ariaLabelAttribute = ariaLabel ? ` aria-label="${ariaLabel}"` : ''

  return `
    <button class="h-[var(--button-height-md)] rounded-icebear-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variantClass}" type="button"${ariaLabelAttribute}${disabledAttribute}>
      ${children}
    </button>
  `
}
