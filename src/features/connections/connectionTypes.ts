export const storageProviderLabels = ['S3', 'R2', 'MinIO'] as const

export type StorageProviderLabel = (typeof storageProviderLabels)[number]

export const objectStorageProviders = ['aws', 'r2', 'minio', 's3-compatible'] as const

export type ObjectStorageProviderValue = (typeof objectStorageProviders)[number]

export function formatProvider(provider: string): string {
  switch (provider) {
    case 'aws':
      return 'S3'
    case 'r2':
      return 'R2'
    case 'minio':
      return 'MinIO'
    default:
      return 'S3-compatible'
  }
}
