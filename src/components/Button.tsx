import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode
  readonly variant?: ButtonVariant
}

export function Button({ children, variant = 'secondary', className = '', type = 'button', ...buttonProps }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white shadow-icebear-sm hover:bg-primary-hover'
      : 'border border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink'

  return (
    <button
      className={`h-[var(--button-height-md)] rounded-icebear-sm px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variantClass} ${className}`}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
