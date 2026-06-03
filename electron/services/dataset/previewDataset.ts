import { detectFormat, type DatasetFormat } from './detectFormat'

export interface PreviewDatasetInput {
  readonly bucket: string
  readonly key: string
  readonly contentType?: string
  readonly limit?: number
}

export interface DatasetPreview {
  readonly bucket: string
  readonly key: string
  readonly format: DatasetFormat
  readonly columns: string[]
  readonly rows: Array<Record<string, unknown>>
  readonly limit: number
}

export async function previewDataset(input: PreviewDatasetInput): Promise<DatasetPreview> {
  return {
    bucket: input.bucket,
    key: input.key,
    format: detectFormat({ key: input.key, contentType: input.contentType }),
    columns: [],
    rows: [],
    limit: input.limit ?? 100,
  }
}
