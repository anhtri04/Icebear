import type { AppState } from '../appTypes'

export const initialState: AppState = {
  connections: [],
  bucketsByConnectionId: {},
  objectsByBucketId: {},
  objectMetadataById: {},
  selection: { type: 'none' },
  isLoadingConnections: true,
  loadingBucketConnectionIds: [],
  loadingObjectBucketIds: [],
  loadingObjectMetadataIds: [],
  errorsByNodeId: {},
  isConnectionModalOpen: false,
}
