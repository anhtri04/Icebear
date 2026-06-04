import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  readonly icon: ReactNode
  readonly eyebrow?: string
  readonly title: string
  readonly description: string
  readonly actionLabel?: string
  readonly onAction?: () => void
}

export function EmptyState({ icon, eyebrow, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-icebear-xl bg-primary-soft text-2xl text-primary">
        {icon}
      </div>
      {eyebrow ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p> : null}
      <h2 className="m-0 mt-3 text-2xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
      {actionLabel ? (
        <div className="mt-8">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
