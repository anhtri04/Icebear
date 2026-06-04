import type { ButtonHTMLAttributes } from 'react'

export type IconButtonVariant = 'primary' | 'secondary'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly label: string
  readonly icon: string
  readonly variant?: IconButtonVariant
}

export function IconButton({ label, icon, variant = 'secondary', className = '', type = 'button', ...buttonProps }: IconButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white shadow-icebear-sm hover:bg-primary-hover'
      : 'border border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink'

  return (
    <button
      className={`grid size-8 place-items-center rounded-icebear-sm text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${variantClass} ${className}`}
      type={type}
      aria-label={label}
      {...buttonProps}
    >
      {icon}
    </button>
  )
}
