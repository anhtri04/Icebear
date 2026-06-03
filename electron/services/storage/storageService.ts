import { createS3Client, type S3ConnectionConfig } from './s3Client'

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

export interface ListObjectsInput {
  readonly connection: S3ConnectionConfig
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

export class StorageService {
  async listBuckets(connection: S3ConnectionConfig): Promise<StorageBucket[]> {
    createS3Client(connection)
    return []
  }

  async listObjects(input: ListObjectsInput): Promise<ListObjectsResult> {
    createS3Client(input.connection)

    return {
      objects: [],
      prefixes: [],
    }
  }
}

export const storageService = new StorageService()
