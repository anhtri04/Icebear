export const storageProviderLabels = ['S3', 'R2', 'MinIO'] as const

export type StorageProviderLabel = (typeof storageProviderLabels)[number]

export interface ConnectionTreeNode {
  readonly id: string
  readonly name: string
  readonly kind: 'connection' | 'bucket' | 'prefix' | 'object'
  readonly provider?: StorageProviderLabel
  readonly children?: ConnectionTreeNode[]
}
