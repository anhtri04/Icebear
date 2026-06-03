interface PanelProps {
  readonly children: string
  readonly className?: string
}

export function Panel({ children, className = '' }: PanelProps): string {
  return `
    <section class="rounded-icebear-xl border border-border bg-surface shadow-icebear-md ${className}">
      ${children}
    </section>
  `
}
