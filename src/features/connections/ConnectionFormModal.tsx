import { objectStorageProviders, formatProvider } from './connectionTypes'

interface ConnectionFormModalProps {
  readonly statusMessage?: string
}

export function ConnectionFormModal({ statusMessage }: ConnectionFormModalProps): string {
  return `
    <div class="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-6" role="dialog" aria-modal="true" aria-labelledby="connection-form-title">
      <form id="connection-form" class="w-full max-w-2xl rounded-icebear-xl border border-border bg-surface p-6 shadow-icebear-lg">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">New connection</p>
            <h2 id="connection-form-title" class="m-0 mt-2 text-xl font-semibold text-ink">Add object storage connection</h2>
            <p class="m-0 mt-1 text-sm text-ink-muted">Credentials are saved by the Electron main process and redacted in the renderer.</p>
          </div>
          <button class="grid size-8 place-items-center rounded-icebear-sm border border-border text-ink-muted hover:border-border-strong hover:text-ink" type="button" data-action="close-connection-modal" aria-label="Close dialog">×</button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          ${Field({ label: 'Connection name', name: 'name', placeholder: 'Production analytics', required: true })}
          <label class="block">
            <span class="mb-1.5 block text-sm font-medium text-ink">Provider</span>
            <select class="h-[var(--input-height)] w-full rounded-icebear-md border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary" name="provider">
              ${objectStorageProviders.map((provider) => `<option value="${provider}">${formatProvider(provider)}</option>`).join('')}
            </select>
          </label>
          ${Field({ label: 'Region', name: 'region', placeholder: 'us-east-1 / auto' })}
          ${Field({ label: 'Endpoint', name: 'endpoint', placeholder: 'https://example.r2.cloudflarestorage.com' })}
          ${Field({ label: 'Access key ID', name: 'accessKeyId', placeholder: 'AKIA...' })}
          ${Field({ label: 'Secret access key', name: 'secretAccessKey', type: 'password', placeholder: '••••••••' })}
          <div class="md:col-span-2">
            ${Field({ label: 'Session token', name: 'sessionToken', type: 'password', placeholder: 'Optional temporary credentials' })}
          </div>
        </div>

        <label class="mt-4 flex items-center gap-2 text-sm text-ink-muted">
          <input class="size-4 rounded border-border text-primary" type="checkbox" name="forcePathStyle" />
          Force path-style URLs, commonly needed for MinIO
        </label>

        ${statusMessage ? `<p class="mt-4 rounded-icebear-md bg-primary-soft px-3 py-2 text-sm text-primary">${statusMessage}</p>` : ''}

        <div class="mt-6 flex justify-end gap-3">
          <button class="h-[var(--button-height-md)] rounded-icebear-md border border-border bg-surface px-4 text-sm font-semibold text-ink-muted transition hover:border-border-strong hover:text-ink" type="button" data-action="close-connection-modal">Cancel</button>
          <button class="h-[var(--button-height-md)] rounded-icebear-md border border-border bg-surface px-4 text-sm font-semibold text-ink-muted transition hover:border-border-strong hover:text-ink" type="button" data-action="test-connection-config">Test connection</button>
          <button class="h-[var(--button-height-md)] rounded-icebear-md bg-primary px-4 text-sm font-semibold text-white shadow-icebear-sm transition hover:bg-primary-hover" type="submit">Save connection</button>
        </div>
      </form>
    </div>
  `
}

interface FieldProps {
  readonly label: string
  readonly name: string
  readonly placeholder: string
  readonly type?: string
  readonly required?: boolean
}

function Field({ label, name, placeholder, type = 'text', required = false }: FieldProps): string {
  return `
    <label class="block">
      <span class="mb-1.5 block text-sm font-medium text-ink">${label}</span>
      <input class="h-[var(--input-height)] w-full rounded-icebear-md border border-border bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary" type="${type}" name="${name}" placeholder="${placeholder}"${required ? ' required' : ''} />
    </label>
  `
}
