import type { RedactedObjectStorageConnection } from '../../electron/services/credentials/credentialService'
import type { ListObjectsResult, ObjectMetadata, StorageBucket } from '../../electron/services/storage/storageService'
import type { AppState, Selection } from '../appTypes'

export type AppAction =
  | { readonly type: 'connections/loadStarted' }
  | { readonly type: 'connections/loadSucceeded'; readonly connections: RedactedObjectStorageConnection[] }
  | { readonly type: 'connections/loadFailed'; readonly message: string }
  | { readonly type: 'connectionModal/open' }
  | { readonly type: 'connectionModal/close' }
  | { readonly type: 'selection/changed'; readonly selection: Selection }
  | { readonly type: 'buckets/loadStarted'; readonly connectionId: string }
  | { readonly type: 'buckets/loadSucceeded'; readonly connectionId: string; readonly buckets: StorageBucket[] }
  | { readonly type: 'buckets/loadFailed'; readonly connectionId: string; readonly message: string }
  | { readonly type: 'objects/loadStarted'; readonly id: string }
  | { readonly type: 'objects/loadSucceeded'; readonly id: string; readonly result: ListObjectsResult }
  | { readonly type: 'objects/loadFailed'; readonly id: string; readonly message: string }
  | { readonly type: 'objectMetadata/loadStarted'; readonly id: string }
  | { readonly type: 'objectMetadata/loadSucceeded'; readonly id: string; readonly metadata: ObjectMetadata }
  | { readonly type: 'objectMetadata/loadFailed'; readonly id: string; readonly message: string }
  | { readonly type: 'connection/saveSucceeded' }
  | { readonly type: 'connection/saveFailed'; readonly message: string }
  | { readonly type: 'connection/testValidationFailed'; readonly message: string }
  | { readonly type: 'connection/testSucceeded'; readonly message: string }
  | { readonly type: 'connection/testFailed'; readonly message: string }
  | { readonly type: 'connection/deleteSucceeded'; readonly connectionId: string }
  | { readonly type: 'connection/deleteFailed'; readonly message: string }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'connections/loadStarted':
      return { ...state, isLoadingConnections: true }

    case 'connections/loadSucceeded':
      return { ...state, connections: action.connections, isLoadingConnections: false }

    case 'connections/loadFailed':
      return { ...state, isLoadingConnections: false, statusMessage: action.message }

    case 'connectionModal/open':
      return { ...state, isConnectionModalOpen: true, statusMessage: undefined }

    case 'connectionModal/close':
      return { ...state, isConnectionModalOpen: false, statusMessage: undefined }

    case 'selection/changed':
      return { ...state, selection: action.selection }

    case 'buckets/loadStarted':
      return {
        ...state,
        loadingBucketConnectionIds: state.loadingBucketConnectionIds.includes(action.connectionId)
          ? state.loadingBucketConnectionIds
          : [...state.loadingBucketConnectionIds, action.connectionId],
        errorsByNodeId: { ...state.errorsByNodeId, [action.connectionId]: '' },
      }

    case 'buckets/loadSucceeded':
      return {
        ...state,
        bucketsByConnectionId: { ...state.bucketsByConnectionId, [action.connectionId]: action.buckets },
        loadingBucketConnectionIds: state.loadingBucketConnectionIds.filter((id) => id !== action.connectionId),
      }

    case 'buckets/loadFailed':
      return {
        ...state,
        loadingBucketConnectionIds: state.loadingBucketConnectionIds.filter((id) => id !== action.connectionId),
        errorsByNodeId: { ...state.errorsByNodeId, [action.connectionId]: action.message },
      }

    case 'objects/loadStarted':
      return {
        ...state,
        loadingObjectBucketIds: state.loadingObjectBucketIds.includes(action.id)
          ? state.loadingObjectBucketIds
          : [...state.loadingObjectBucketIds, action.id],
        errorsByNodeId: { ...state.errorsByNodeId, [action.id]: '' },
      }

    case 'objects/loadSucceeded':
      return {
        ...state,
        objectsByBucketId: { ...state.objectsByBucketId, [action.id]: action.result },
        loadingObjectBucketIds: state.loadingObjectBucketIds.filter((id) => id !== action.id),
      }

    case 'objects/loadFailed':
      return {
        ...state,
        loadingObjectBucketIds: state.loadingObjectBucketIds.filter((id) => id !== action.id),
        errorsByNodeId: { ...state.errorsByNodeId, [action.id]: action.message },
      }

    case 'objectMetadata/loadStarted':
      return {
        ...state,
        loadingObjectMetadataIds: state.loadingObjectMetadataIds.includes(action.id)
          ? state.loadingObjectMetadataIds
          : [...state.loadingObjectMetadataIds, action.id],
        errorsByNodeId: { ...state.errorsByNodeId, [action.id]: '' },
      }

    case 'objectMetadata/loadSucceeded':
      return {
        ...state,
        objectMetadataById: { ...state.objectMetadataById, [action.id]: action.metadata },
        loadingObjectMetadataIds: state.loadingObjectMetadataIds.filter((id) => id !== action.id),
      }

    case 'objectMetadata/loadFailed':
      return {
        ...state,
        loadingObjectMetadataIds: state.loadingObjectMetadataIds.filter((id) => id !== action.id),
        errorsByNodeId: { ...state.errorsByNodeId, [action.id]: action.message },
      }

    case 'connection/saveSucceeded':
      return { ...state, isConnectionModalOpen: false, statusMessage: 'Connection saved' }

    case 'connection/saveFailed':
      return { ...state, isConnectionModalOpen: true, statusMessage: action.message }

    case 'connection/testValidationFailed':
    case 'connection/testSucceeded':
    case 'connection/testFailed':
      return { ...state, isConnectionModalOpen: true, statusMessage: action.message }

    case 'connection/deleteSucceeded':
      return {
        ...state,
        selection: { type: 'none' },
        bucketsByConnectionId: removeKey(state.bucketsByConnectionId, action.connectionId),
        objectsByBucketId: removeKeysByPrefix(state.objectsByBucketId, `${action.connectionId}::`),
        objectMetadataById: removeKeysByPrefix(state.objectMetadataById, `${action.connectionId}::`),
        connections: state.connections.filter((connection) => connection.id !== action.connectionId),
      }

    case 'connection/deleteFailed':
      return { ...state, statusMessage: action.message }
  }
}

function removeKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}

function removeKeysByPrefix<T>(record: Record<string, T>, prefix: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith(prefix)))
}
