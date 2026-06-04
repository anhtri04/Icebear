export type IconButtonVariant = 'primary' | 'secondary'

interface IconButtonProps {
  readonly label: string
  readonly icon: string
  readonly variant?: IconButtonVariant
  readonly disabled?: boolean
  readonly dataAction?: string
}

export function IconButton({ label, icon, variant = 'secondary', disabled = false, dataAction }: IconButtonProps): string {
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white shadow-icebear-sm hover:bg-primary-hover'
      : 'border border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink'

  const disabledAttribute = disabled ? ' disabled' : ''
  const dataActionAttribute = dataAction ? ` data-action="${dataAction}"` : ''

  return `
    <button class="grid size-8 place-items-center rounded-icebear-sm text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${variantClass}" type="button" aria-label="${label}"${dataActionAttribute}${disabledAttribute}>
      ${icon}
    </button>
  `
}
