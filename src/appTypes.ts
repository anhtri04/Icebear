import type { RedactedObjectStorageConnection } from '../shared/credentialTypes'
import type { ListObjectsResult, ObjectMetadata, StorageBucket } from '../shared/storageTypes'

export type Selection =
  | { readonly type: 'none' }
  | { readonly type: 'connection'; readonly connectionId: string }
  | { readonly type: 'bucket'; readonly connectionId: string; readonly bucket: string; readonly prefix?: string }
  | { readonly type: 'object'; readonly connectionId: string; readonly bucket: string; readonly prefix?: string; readonly key: string }

export interface AppState {
  readonly connections: RedactedObjectStorageConnection[]
  readonly bucketsByConnectionId: Record<string, StorageBucket[]>
  readonly objectsByBucketId: Record<string, ListObjectsResult>
  readonly objectMetadataById: Record<string, ObjectMetadata>
  readonly selection: Selection
  readonly isLoadingConnections: boolean
  readonly loadingBucketConnectionIds: readonly string[]
  readonly loadingObjectBucketIds: readonly string[]
  readonly loadingObjectMetadataIds: readonly string[]
  readonly errorsByNodeId: Record<string, string>
  readonly isConnectionModalOpen: boolean
  readonly statusMessage?: string
}

export function bucketNodeId(connectionId: string, bucket: string): string {
  return objectListNodeId(connectionId, bucket)
}

export function objectListNodeId(connectionId: string, bucket: string, prefix = ''): string {
  return `${connectionId}::${bucket}::list::${prefix}`
}

export function objectNodeId(connectionId: string, bucket: string, key: string): string {
  return `${connectionId}::${bucket}::object::${key}`
}
