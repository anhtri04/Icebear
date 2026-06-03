import { Panel } from '../../components/Panel'

export function ObjectDetail(): string {
  return Panel({
    className: 'p-6',
    children: `
      <p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Object detail</p>
      <h2 class="m-0 mt-2 text-xl font-semibold text-ink">Select an object</h2>
      <p class="m-0 mt-3 text-sm text-ink-muted">Metadata and dataset actions will appear here later.</p>
    `,
  })
}
