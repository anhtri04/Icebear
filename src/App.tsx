import { AppShell } from './components/AppShell'
import type { AppState } from './appTypes'

const initialState: AppState = {
  connections: [],
  bucketsByConnectionId: {},
  objectsByBucketId: {},
  selection: { type: 'none' },
  isLoadingConnections: false,
  loadingBucketConnectionIds: [],
  loadingObjectBucketIds: [],
  errorsByNodeId: {},
  isConnectionModalOpen: false,
}

export function App(state: AppState = initialState): string {
  return AppShell({ state })
}
