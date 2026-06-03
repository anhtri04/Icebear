import {
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import { credentialService, type CredentialService } from '../credentials/credentialService'
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

type ConnectionResolver = Pick<CredentialService, 'resolveConnection'>

export class StorageService {
  constructor(private readonly credentials: ConnectionResolver = credentialService) {}

  async validateConnection(input: ValidateConnectionInput): Promise<ValidateConnectionResult> {
    return this.validateResolvedConnection(input)
  }

  async validateConnectionConfig(input: ValidateConnectionConfigInput): Promise<ValidateConnectionResult> {
    return this.validateResolvedConnection(input)
  }

  async listBuckets(input: ListBucketsInput): Promise<StorageBucket[]> {
    try {
      const connection = await this.resolveConnection(input)
      const client = createS3Client(connection)
      const response = await client.send(new ListBucketsCommand({}))

      return (response.Buckets ?? [])
        .filter((bucket) => Boolean(bucket.Name))
        .map((bucket) => ({
          name: bucket.Name ?? '',
          createdAt: bucket.CreationDate?.toISOString(),
        }))
    } catch (error) {
      throw normalizeStorageError(error)
    }
  }

  async listObjects(input: ListObjectsInput): Promise<ListObjectsResult> {
    try {
      const connection = await this.resolveConnection(input)
      const client = createS3Client(connection)
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: input.bucket,
          Prefix: input.prefix,
          ContinuationToken: input.continuationToken,
          MaxKeys: input.maxKeys ?? 1000,
          Delimiter: '/',
        }),
      )

      return {
        objects: (response.Contents ?? [])
          .filter((object) => Boolean(object.Key))
          .map((object) => ({
            bucket: input.bucket,
            key: object.Key ?? '',
            size: object.Size,
            lastModified: object.LastModified?.toISOString(),
            etag: stripEtagQuotes(object.ETag),
          })),
        prefixes: (response.CommonPrefixes ?? [])
          .map((prefix) => prefix.Prefix)
          .filter((prefix): prefix is string => Boolean(prefix)),
        continuationToken: response.NextContinuationToken,
      }
    } catch (error) {
      throw normalizeStorageError(error)
    }
  }

  async getObjectMetadata(input: GetObjectMetadataInput): Promise<ObjectMetadata> {
    try {
      const connection = await this.resolveConnection(input)
      const client = createS3Client(connection)
      const response = await client.send(
        new HeadObjectCommand({
          Bucket: input.bucket,
          Key: input.key,
        }),
      )

      return {
        bucket: input.bucket,
        key: input.key,
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified?.toISOString(),
        etag: stripEtagQuotes(response.ETag),
        metadata: response.Metadata ?? {},
      }
    } catch (error) {
      throw normalizeStorageError(error)
    }
  }

  private async validateResolvedConnection(input: ValidateConnectionInput | ValidateConnectionConfigInput): Promise<ValidateConnectionResult> {
    try {
      const connection = await this.resolveConnection(input)
      const client = createS3Client(connection)
      await client.send(new ListBucketsCommand({}))
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        message: normalizeStorageError(error).message,
      }
    }
  }

  private async resolveConnection(input: ValidateConnectionInput | ValidateConnectionConfigInput): Promise<S3ConnectionConfig> {
    if ('connectionId' in input) {
      return this.credentials.resolveConnection(input.connectionId)
    }

    return input
  }
}

function stripEtagQuotes(etag: string | undefined): string | undefined {
  return etag?.replace(/^"|"$/g, '')
}

function normalizeStorageError(error: unknown): Error {
  if (error instanceof S3ServiceException) {
    switch (error.name) {
      case 'AccessDenied':
      case 'InvalidAccessKeyId':
      case 'SignatureDoesNotMatch':
        return new Error('Unable to access object storage with the provided credentials')
      case 'NoSuchBucket':
        return new Error('Bucket not found')
      case 'NoSuchKey':
        return new Error('Object not found')
      case 'PermanentRedirect':
      case 'AuthorizationHeaderMalformed':
        return new Error('Storage region or endpoint appears to be incorrect')
      default:
        return new Error(error.message || 'Object storage request failed')
    }
  }

  if (error instanceof Error) {
    if ('code' in error && error.code === 'ENOTFOUND') {
      return new Error('Unable to reach the configured storage endpoint')
    }

    return new Error(error.message)
  }

  return new Error('Object storage request failed')
}

export const storageService = new StorageService()
