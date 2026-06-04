import { useCallback, useEffect, useRef, useState } from 'react'
import { AppShell } from './components/AppShell'
import type { SaveObjectStorageConnectionInput } from '../electron/services/credentials/credentialService'
import type { AppState } from './appTypes'
import { bucketNodeId } from './appTypes'

const initialState: AppState = {
  connections: [],
  bucketsByConnectionId: {},
  objectsByBucketId: {},
  selection: { type: 'none' },
  isLoadingConnections: true,
  loadingBucketConnectionIds: [],
  loadingObjectBucketIds: [],
  errorsByNodeId: {},
  isConnectionModalOpen: false,
}

export function App() {
  const [state, setReactState] = useState<AppState>(initialState)
  const stateRef = useRef(state)

  const setState = useCallback((updater: (current: AppState) => AppState): void => {
    setReactState((current) => updater(current))
  }, [])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const loadConnections = useCallback(async (): Promise<void> => {
    setState((current) => ({ ...current, isLoadingConnections: true }))

    try {
      const connections = await window.electronAPI.credentials.listConnections()
      setState((current) => ({ ...current, connections, isLoadingConnections: false }))
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoadingConnections: false,
        statusMessage: errorMessage(error, 'Unable to load connections'),
      }))
    }
  }, [setState])

  const loadBuckets = useCallback(
    async (connectionId: string): Promise<void> => {
      if (stateRef.current.loadingBucketConnectionIds.includes(connectionId)) {
        return
      }

      setState((current) => ({
        ...current,
        loadingBucketConnectionIds: current.loadingBucketConnectionIds.includes(connectionId)
          ? current.loadingBucketConnectionIds
          : [...current.loadingBucketConnectionIds, connectionId],
        errorsByNodeId: { ...current.errorsByNodeId, [connectionId]: '' },
      }))

      try {
        const buckets = await window.electronAPI.storage.listBuckets({ connectionId })
        setState((current) => ({
          ...current,
          bucketsByConnectionId: { ...current.bucketsByConnectionId, [connectionId]: buckets },
          loadingBucketConnectionIds: current.loadingBucketConnectionIds.filter((id) => id !== connectionId),
        }))
      } catch (error) {
        setState((current) => ({
          ...current,
          loadingBucketConnectionIds: current.loadingBucketConnectionIds.filter((id) => id !== connectionId),
          errorsByNodeId: { ...current.errorsByNodeId, [connectionId]: errorMessage(error, 'Unable to list buckets') },
        }))
      }
    },
    [setState],
  )

  const loadObjects = useCallback(
    async (connectionId: string, bucket: string): Promise<void> => {
      const id = bucketNodeId(connectionId, bucket)

      if (stateRef.current.loadingObjectBucketIds.includes(id)) {
        return
      }

      setState((current) => ({
        ...current,
        loadingObjectBucketIds: current.loadingObjectBucketIds.includes(id) ? current.loadingObjectBucketIds : [...current.loadingObjectBucketIds, id],
        errorsByNodeId: { ...current.errorsByNodeId, [id]: '' },
      }))

      try {
        const result = await window.electronAPI.storage.listObjects({ connectionId, bucket })
        setState((current) => ({
          ...current,
          objectsByBucketId: { ...current.objectsByBucketId, [id]: result },
          loadingObjectBucketIds: current.loadingObjectBucketIds.filter((item) => item !== id),
        }))
      } catch (error) {
        setState((current) => ({
          ...current,
          loadingObjectBucketIds: current.loadingObjectBucketIds.filter((item) => item !== id),
          errorsByNodeId: { ...current.errorsByNodeId, [id]: errorMessage(error, 'Unable to list objects') },
        }))
      }
    },
    [setState],
  )

  useEffect(() => {
    void loadConnections()
  }, [loadConnections])

  const openConnectionModal = useCallback((): void => {
    setState((current) => ({ ...current, isConnectionModalOpen: true, statusMessage: undefined }))
  }, [setState])

  const closeConnectionModal = useCallback((): void => {
    setState((current) => ({ ...current, isConnectionModalOpen: false, statusMessage: undefined }))
  }, [setState])

  const selectConnection = useCallback(
    (connectionId: string): void => {
      setState((current) => ({ ...current, selection: { type: 'connection', connectionId } }))
      void loadBuckets(connectionId)
    },
    [loadBuckets, setState],
  )

  const selectBucket = useCallback(
    (connectionId: string, bucket: string): void => {
      setState((current) => ({ ...current, selection: { type: 'bucket', connectionId, bucket } }))
      void loadObjects(connectionId, bucket)
    },
    [loadObjects, setState],
  )

  const refreshSelectedBuckets = useCallback((): void => {
    const { selection } = stateRef.current
    if (selection.type === 'connection') {
      void loadBuckets(selection.connectionId)
    }
  }, [loadBuckets])

  const refreshSelectedObjects = useCallback((): void => {
    const { selection } = stateRef.current
    if (selection.type === 'bucket') {
      void loadObjects(selection.connectionId, selection.bucket)
    }
  }, [loadObjects])

  const saveConnection = useCallback(
    async (input: SaveObjectStorageConnectionInput): Promise<void> => {
      try {
        await window.electronAPI.credentials.saveConnection(input)
        setState((current) => ({ ...current, isConnectionModalOpen: false, statusMessage: 'Connection saved' }))
        await loadConnections()
      } catch (error) {
        setState((current) => ({
          ...current,
          isConnectionModalOpen: true,
          statusMessage: errorMessage(error, 'Unable to save connection'),
        }))
      }
    },
    [loadConnections, setState],
  )

  const testConnectionConfig = useCallback(
    async (input: SaveObjectStorageConnectionInput): Promise<void> => {
      try {
        const result = await window.electronAPI.storage.validateConnectionConfig(input)
        setState((current) => ({
          ...current,
          isConnectionModalOpen: true,
          statusMessage: result.ok ? 'Connection test succeeded' : result.message ?? 'Connection test failed',
        }))
      } catch (error) {
        setState((current) => ({
          ...current,
          isConnectionModalOpen: true,
          statusMessage: errorMessage(error, 'Connection test failed'),
        }))
      }
    },
    [setState],
  )

  const deleteSelectedConnection = useCallback(async (): Promise<void> => {
    const { selection } = stateRef.current
    const connectionId = selection.type === 'none' ? undefined : selection.connectionId

    if (!connectionId || !confirm('Delete this connection?')) {
      return
    }

    try {
      await window.electronAPI.credentials.deleteConnection(connectionId)
      setState((current) => ({
        ...current,
        selection: { type: 'none' },
        bucketsByConnectionId: removeKey(current.bucketsByConnectionId, connectionId),
        objectsByBucketId: removeKeysByPrefix(current.objectsByBucketId, `${connectionId}::`),
        connections: current.connections.filter((connection) => connection.id !== connectionId),
      }))
    } catch (error) {
      setState((current) => ({ ...current, statusMessage: errorMessage(error, 'Unable to delete connection') }))
    }
  }, [setState])

  return (
    <AppShell
      state={state}
      onOpenConnectionModal={openConnectionModal}
      onCloseConnectionModal={closeConnectionModal}
      onRefreshConnections={() => void loadConnections()}
      onDeleteSelectedConnection={() => void deleteSelectedConnection()}
      onRefreshSelectedBuckets={refreshSelectedBuckets}
      onRefreshSelectedObjects={refreshSelectedObjects}
      onSelectConnection={selectConnection}
      onSelectBucket={selectBucket}
      onSaveConnection={(input) => void saveConnection(input)}
      onTestConnection={(input) => void testConnectionConfig(input)}
    />
  )
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function removeKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}

function removeKeysByPrefix<T>(record: Record<string, T>, prefix: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith(prefix)))
}
