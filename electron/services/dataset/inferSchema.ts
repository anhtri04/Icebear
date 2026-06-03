import type { DatasetFormat } from './detectFormat'

export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'null' | 'unknown'

export interface DatasetSchemaField {
  readonly name: string
  readonly type: SchemaFieldType
  readonly nullable: boolean
}

export interface InferSchemaInput {
  readonly format: DatasetFormat
  readonly sampleRows?: Array<Record<string, unknown>>
}

export interface DatasetSchema {
  readonly format: DatasetFormat
  readonly fields: DatasetSchemaField[]
}

export function inferSchema(input: InferSchemaInput): DatasetSchema {
  const fields = new Map<string, DatasetSchemaField>()

  for (const row of input.sampleRows ?? []) {
    for (const [name, value] of Object.entries(row)) {
      const existing = fields.get(name)
      const type = inferFieldType(value)

      fields.set(name, {
        name,
        type: existing && existing.type !== type ? 'unknown' : type,
        nullable: existing?.nullable ?? value === null,
      })
    }
  }

  return {
    format: input.format,
    fields: Array.from(fields.values()),
  }
}

function inferFieldType(value: unknown): SchemaFieldType {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  if (value instanceof Date) {
    return 'date'
  }

  switch (typeof value) {
    case 'string':
      return isIsoDate(value) ? 'date' : 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      return 'object'
    default:
      return 'unknown'
  }
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && !Number.isNaN(Date.parse(value))
}
