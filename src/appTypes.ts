import type { RedactedObjectStorageConnection } from '../electron/services/credentials/credentialService'
import type { ListObjectsResult, StorageBucket } from '../electron/services/storage/storageService'

export type Selection =
  | { readonly type: 'none' }
  | { readonly type: 'connection'; readonly connectionId: string }
  | { readonly type: 'bucket'; readonly connectionId: string; readonly bucket: string }

export interface AppState {
  readonly connections: RedactedObjectStorageConnection[]
  readonly bucketsByConnectionId: Record<string, StorageBucket[]>
  readonly objectsByBucketId: Record<string, ListObjectsResult>
  readonly selection: Selection
  readonly isLoadingConnections: boolean
  readonly loadingBucketConnectionIds: readonly string[]
  readonly loadingObjectBucketIds: readonly string[]
  readonly errorsByNodeId: Record<string, string>
  readonly isConnectionModalOpen: boolean
  readonly statusMessage?: string
}

export function bucketNodeId(connectionId: string, bucket: string): string {
  return `${connectionId}::${bucket}`
}
