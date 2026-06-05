export type ObjectStorageProvider = 'aws' | 'r2' | 'minio' | 's3-compatible'

export interface S3ConnectionConfig {
  readonly provider: ObjectStorageProvider
  readonly region?: string
  readonly endpoint?: string
  readonly accessKeyId?: string
  readonly secretAccessKey?: string
  readonly sessionToken?: string
  readonly forcePathStyle?: boolean
}

export interface StorageBucket {
  readonly name: string
  readonly createdAt?: string
}

export interface StorageObject {
  readonly bucket: string
  readonly key: string
  readonly size?: number
  readonly contentType?: string
  readonly lastModified?: string
  readonly etag?: string
}

export interface ConnectionIdInput {
  readonly connectionId: string
}

export interface ValidateConnectionInput extends ConnectionIdInput {}

export type ValidateConnectionConfigInput = S3ConnectionConfig

export interface ListBucketsInput extends ConnectionIdInput {}

export interface ListObjectsInput extends ConnectionIdInput {
  readonly bucket: string
  readonly prefix?: string
  readonly continuationToken?: string
  readonly maxKeys?: number
}

export interface ListObjectsResult {
  readonly objects: StorageObject[]
  readonly prefixes: string[]
  readonly continuationToken?: string
}

export interface GetObjectMetadataInput extends ConnectionIdInput {
  readonly bucket: string
  readonly key: string
}

export interface ObjectMetadata extends StorageObject {
  readonly metadata: Record<string, string>
}

export interface ValidateConnectionResult {
  readonly ok: boolean
  readonly message?: string
}
