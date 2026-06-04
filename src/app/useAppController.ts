import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { SaveObjectStorageConnectionInput } from '../../electron/services/credentials/credentialService'
import { objectListNodeId, objectNodeId } from '../appTypes'
import { validateConnectionTestInput } from '../features/connections/connectionValidation'
import { appReducer } from './appReducer'
import { initialState } from './appState'

export function useAppController() {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const loadConnections = useCallback(async (): Promise<void> => {
    dispatch({ type: 'connections/loadStarted' })

    try {
      const connections = await window.electronAPI.credentials.listConnections()
      dispatch({ type: 'connections/loadSucceeded', connections })
    } catch (error) {
      dispatch({ type: 'connections/loadFailed', message: errorMessage(error, 'Unable to load connections') })
    }
  }, [])

  const loadBuckets = useCallback(async (connectionId: string): Promise<void> => {
    if (stateRef.current.loadingBucketConnectionIds.includes(connectionId)) {
      return
    }

    dispatch({ type: 'buckets/loadStarted', connectionId })

    try {
      const buckets = await window.electronAPI.storage.listBuckets({ connectionId })
      dispatch({ type: 'buckets/loadSucceeded', connectionId, buckets })
    } catch (error) {
      dispatch({ type: 'buckets/loadFailed', connectionId, message: errorMessage(error, 'Unable to list buckets') })
    }
  }, [])

  const loadObjects = useCallback(async (connectionId: string, bucket: string, prefix = ''): Promise<void> => {
    const id = objectListNodeId(connectionId, bucket, prefix)

    if (stateRef.current.loadingObjectBucketIds.includes(id)) {
      return
    }

    dispatch({ type: 'objects/loadStarted', id })

    try {
      const result = await window.electronAPI.storage.listObjects({ connectionId, bucket, prefix })
      dispatch({ type: 'objects/loadSucceeded', id, result })
    } catch (error) {
      dispatch({ type: 'objects/loadFailed', id, message: errorMessage(error, 'Unable to list objects') })
    }
  }, [])

  const loadObjectMetadata = useCallback(async (connectionId: string, bucket: string, key: string): Promise<void> => {
    const id = objectNodeId(connectionId, bucket, key)

    if (stateRef.current.loadingObjectMetadataIds.includes(id)) {
      return
    }

    dispatch({ type: 'objectMetadata/loadStarted', id })

    try {
      const metadata = await window.electronAPI.storage.getObjectMetadata({ connectionId, bucket, key })
      dispatch({ type: 'objectMetadata/loadSucceeded', id, metadata })
    } catch (error) {
      dispatch({ type: 'objectMetadata/loadFailed', id, message: errorMessage(error, 'Unable to load object metadata') })
    }
  }, [])

  useEffect(() => {
    void loadConnections()
  }, [loadConnections])

  const onOpenConnectionModal = useCallback((): void => {
    dispatch({ type: 'connectionModal/open' })
  }, [])

  const onCloseConnectionModal = useCallback((): void => {
    dispatch({ type: 'connectionModal/close' })
  }, [])

  const onSelectConnection = useCallback(
    (connectionId: string): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'connection', connectionId } })
      void loadBuckets(connectionId)
    },
    [loadBuckets],
  )

  const onSelectBucket = useCallback(
    (connectionId: string, bucket: string): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'bucket', connectionId, bucket, prefix: '' } })
      void loadObjects(connectionId, bucket)
    },
    [loadObjects],
  )

  const onSelectPrefix = useCallback(
    (connectionId: string, bucket: string, prefix: string): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'bucket', connectionId, bucket, prefix } })
      void loadObjects(connectionId, bucket, prefix)
    },
    [loadObjects],
  )

  const onSelectObject = useCallback(
    (connectionId: string, bucket: string, key: string, prefix = ''): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'object', connectionId, bucket, key, prefix } })
      void loadObjectMetadata(connectionId, bucket, key)
    },
    [loadObjectMetadata],
  )

  const onRefreshConnections = useCallback((): void => {
    void loadConnections()
  }, [loadConnections])

  const onRefreshSelectedBuckets = useCallback((): void => {
    const { selection } = stateRef.current
    if (selection.type === 'connection') {
      void loadBuckets(selection.connectionId)
    }
  }, [loadBuckets])

  const onRefreshSelectedObjects = useCallback((): void => {
    const { selection } = stateRef.current
    if (selection.type === 'bucket') {
      void loadObjects(selection.connectionId, selection.bucket, selection.prefix ?? '')
    }
  }, [loadObjects])

  const onRefreshSelectedObjectMetadata = useCallback((): void => {
    const { selection } = stateRef.current
    if (selection.type === 'object') {
      void loadObjectMetadata(selection.connectionId, selection.bucket, selection.key)
    }
  }, [loadObjectMetadata])

  const saveConnection = useCallback(
    async (input: SaveObjectStorageConnectionInput): Promise<void> => {
      try {
        await window.electronAPI.credentials.saveConnection(input)
        dispatch({ type: 'connection/saveSucceeded' })
        await loadConnections()
      } catch (error) {
        dispatch({ type: 'connection/saveFailed', message: errorMessage(error, 'Unable to save connection') })
      }
    },
    [loadConnections],
  )

  const testConnectionConfig = useCallback(async (input: SaveObjectStorageConnectionInput): Promise<void> => {
    const validationMessage = validateConnectionTestInput(input)
    if (validationMessage) {
      dispatch({ type: 'connection/testValidationFailed', message: validationMessage })
      return
    }

    try {
      const result = await window.electronAPI.storage.validateConnectionConfig(input)
      dispatch({
        type: 'connection/testSucceeded',
        message: result.ok ? 'Connection test succeeded' : result.message ?? 'Connection test failed',
      })
    } catch (error) {
      dispatch({ type: 'connection/testFailed', message: errorMessage(error, 'Connection test failed') })
    }
  }, [])

  const onSaveConnection = useCallback(
    (input: SaveObjectStorageConnectionInput): void => {
      void saveConnection(input)
    },
    [saveConnection],
  )

  const onTestConnection = useCallback(
    (input: SaveObjectStorageConnectionInput): void => {
      void testConnectionConfig(input)
    },
    [testConnectionConfig],
  )

  const onDeleteSelectedConnection = useCallback(async (): Promise<void> => {
    const { selection } = stateRef.current
    const connectionId = selection.type === 'none' ? undefined : selection.connectionId

    if (!connectionId || !confirm('Delete this connection?')) {
      return
    }

    try {
      await window.electronAPI.credentials.deleteConnection(connectionId)
      dispatch({ type: 'connection/deleteSucceeded', connectionId })
    } catch (error) {
      dispatch({ type: 'connection/deleteFailed', message: errorMessage(error, 'Unable to delete connection') })
    }
  }, [])

  return {
    state,
    onOpenConnectionModal,
    onCloseConnectionModal,
    onRefreshConnections,
    onDeleteSelectedConnection: () => void onDeleteSelectedConnection(),
    onRefreshSelectedBuckets,
    onRefreshSelectedObjects,
    onRefreshSelectedObjectMetadata,
    onSelectConnection,
    onSelectBucket,
    onSelectPrefix,
    onSelectObject,
    onSaveConnection,
    onTestConnection,
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
