export type DatasetFormat = 'csv' | 'json' | 'jsonl' | 'parquet' | 'unknown'

export interface DetectDatasetFormatInput {
  readonly key: string
  readonly contentType?: string
}

export function detectFormat(input: DetectDatasetFormatInput): DatasetFormat {
  const key = input.key.toLowerCase()
  const contentType = input.contentType?.toLowerCase() ?? ''

  if (key.endsWith('.parquet')) {
    return 'parquet'
  }

  if (key.endsWith('.jsonl') || key.endsWith('.ndjson')) {
    return 'jsonl'
  }

  if (key.endsWith('.json') || contentType.includes('application/json')) {
    return 'json'
  }

  if (key.endsWith('.csv') || contentType.includes('text/csv')) {
    return 'csv'
  }

  return 'unknown'
}
