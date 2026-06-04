import type { FormEvent } from 'react'
import type { SaveObjectStorageConnectionInput } from '../../../electron/services/credentials/credentialService'
import type { S3Provider } from '../../../electron/services/storage/s3Client'
import { objectStorageProviders, formatProvider } from './connectionTypes'

interface ConnectionFormModalProps {
  readonly statusMessage?: string
  readonly onClose: () => void
  readonly onSave: (input: SaveObjectStorageConnectionInput) => void
  readonly onTest: (input: SaveObjectStorageConnectionInput) => void
}

export function ConnectionFormModal({ statusMessage, onClose, onSave, onTest }: ConnectionFormModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSave(formToConnectionInput(event.currentTarget))
  }

  function handleTest(form: HTMLFormElement): void {
    onTest(formToConnectionInput(form))
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connection-form-title"
    >
      <form id="connection-form" className="w-full max-w-2xl rounded-icebear-xl border border-border bg-surface p-6 shadow-icebear-lg" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-accent">New connection</p>
            <h2 id="connection-form-title" className="m-0 mt-2 text-xl font-semibold text-ink">
              Add object storage connection
            </h2>
            <p className="m-0 mt-1 text-sm text-ink-muted">
              Credentials are saved by the Electron main process and redacted in the renderer.
            </p>
          </div>
          <button
            className="grid size-8 place-items-center rounded-icebear-sm border border-border text-ink-muted hover:border-border-strong hover:text-ink"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Connection name" name="name" placeholder="Production analytics" required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Provider</span>
            <select className="h-[var(--input-height)] w-full rounded-icebear-md border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary" name="provider">
              {objectStorageProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {formatProvider(provider)}
                </option>
              ))}
            </select>
          </label>
          <Field label="Region" name="region" placeholder="us-east-1 / auto" />
          <Field label="Endpoint" name="endpoint" placeholder="https://example.r2.cloudflarestorage.com" />
          <Field label="Access key ID" name="accessKeyId" placeholder="AKIA..." />
          <Field label="Secret access key" name="secretAccessKey" type="password" placeholder="••••••••" />
          <div className="md:col-span-2">
            <Field label="Session token" name="sessionToken" type="password" placeholder="Optional temporary credentials" />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
          <input className="size-4 rounded border-border text-primary" type="checkbox" name="forcePathStyle" />
          Force path-style URLs, commonly needed for MinIO
        </label>

        {statusMessage ? <p className="mt-4 rounded-icebear-md bg-primary-soft px-3 py-2 text-sm text-primary">{statusMessage}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-[var(--button-height-md)] rounded-icebear-md border border-border bg-surface px-4 text-sm font-semibold text-ink-muted transition hover:border-border-strong hover:text-ink"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-[var(--button-height-md)] rounded-icebear-md border border-border bg-surface px-4 text-sm font-semibold text-ink-muted transition hover:border-border-strong hover:text-ink"
            type="button"
            onClick={(event) => handleTest(event.currentTarget.form as HTMLFormElement)}
          >
            Test connection
          </button>
          <button className="h-[var(--button-height-md)] rounded-icebear-md bg-primary px-4 text-sm font-semibold text-white shadow-icebear-sm transition hover:bg-primary-hover" type="submit">
            Save connection
          </button>
        </div>
      </form>
    </div>
  )
}

interface FieldProps {
  readonly label: string
  readonly name: string
  readonly placeholder: string
  readonly type?: string
  readonly required?: boolean
}

function Field({ label, name, placeholder, type = 'text', required = false }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        className="h-[var(--input-height)] w-full rounded-icebear-md border border-border bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary"
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}

function formToConnectionInput(form: HTMLFormElement): SaveObjectStorageConnectionInput {
  const data = new FormData(form)
  const provider = String(data.get('provider') ?? 'aws') as S3Provider

  return {
    name: String(data.get('name') ?? '').trim(),
    provider,
    region: optionalString(data.get('region')),
    endpoint: optionalString(data.get('endpoint')),
    accessKeyId: optionalString(data.get('accessKeyId')),
    secretAccessKey: optionalString(data.get('secretAccessKey')),
    sessionToken: optionalString(data.get('sessionToken')),
    forcePathStyle: data.get('forcePathStyle') === 'on' ? true : undefined,
  }
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const normalized = String(value ?? '').trim()
  return normalized || undefined
}
