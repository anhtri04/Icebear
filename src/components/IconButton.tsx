export type IconButtonVariant = 'primary' | 'secondary'

interface IconButtonProps {
  readonly label: string
  readonly icon: string
  readonly variant?: IconButtonVariant
  readonly disabled?: boolean
}

export function IconButton({ label, icon, variant = 'secondary', disabled = false }: IconButtonProps): string {
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white shadow-icebear-sm hover:bg-primary-hover'
      : 'border border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink'

  const disabledAttribute = disabled ? ' disabled' : ''

  return `
    <button class="grid size-8 place-items-center rounded-icebear-sm text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${variantClass}" type="button" aria-label="${label}"${disabledAttribute}>
      ${icon}
    </button>
  `
}
