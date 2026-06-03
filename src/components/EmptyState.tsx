import { Button } from './Button'

interface EmptyStateProps {
  readonly icon: string
  readonly eyebrow?: string
  readonly title: string
  readonly description: string
  readonly actionLabel?: string
}

export function EmptyState({ icon, eyebrow, title, description, actionLabel }: EmptyStateProps): string {
  return `
    <div class="text-center">
      <div class="mx-auto mb-5 grid size-14 place-items-center rounded-icebear-xl bg-primary-soft text-2xl text-primary">
        ${icon}
      </div>
      ${eyebrow ? `<p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">${eyebrow}</p>` : ''}
      <h2 class="m-0 mt-3 text-2xl font-semibold text-ink">${title}</h2>
      <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
        ${description}
      </p>
      ${actionLabel ? `<div class="mt-8">${Button({ children: actionLabel, variant: 'primary' })}</div>` : ''}
    </div>
  `
}
