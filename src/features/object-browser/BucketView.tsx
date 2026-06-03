import { Panel } from '../../components/Panel'
import { ObjectTable } from './ObjectTable'

export function BucketView(): string {
  return Panel({
    className: 'p-6',
    children: `
      <div class="mb-5 flex items-center justify-between gap-4">
        <div>
          <p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Bucket browser</p>
          <h2 class="m-0 mt-2 text-xl font-semibold text-ink">Objects</h2>
        </div>
      </div>
      ${ObjectTable({ rows: [] })}
    `,
  })
}
