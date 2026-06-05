import type { ObjectStorageProvider, S3ConnectionConfig } from './storageTypes'

export interface ObjectStorageConnection extends S3ConnectionConfig {
  readonly id: string
  readonly name: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface RedactedObjectStorageConnection {
  readonly id: string
  readonly name: string
  readonly provider: ObjectStorageProvider
  readonly region?: string
  readonly endpoint?: string
  readonly accessKeyId?: string
  readonly hasSecretAccessKey: boolean
  readonly hasSessionToken: boolean
  readonly forcePathStyle?: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface SaveObjectStorageConnectionInput extends S3ConnectionConfig {
  readonly id?: string
  readonly name: string
}
