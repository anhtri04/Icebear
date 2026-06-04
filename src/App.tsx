import { useCallback, useEffect, useReducer, useRef } from 'react'
import { AppShell } from './components/AppShell'
import type { SaveObjectStorageConnectionInput } from '../electron/services/credentials/credentialService'
import { appReducer } from './app/appReducer'
import { initialState } from './app/appState'
import { objectListNodeId, objectNodeId } from './appTypes'

export function App() {
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

  const loadBuckets = useCallback(
    async (connectionId: string): Promise<void> => {
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
    },
    [],
  )

  const loadObjects = useCallback(
    async (connectionId: string, bucket: string, prefix = ''): Promise<void> => {
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
    },
    [],
  )

  const loadObjectMetadata = useCallback(
    async (connectionId: string, bucket: string, key: string): Promise<void> => {
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
    },
    [],
  )

  useEffect(() => {
    void loadConnections()
  }, [loadConnections])

  const openConnectionModal = useCallback((): void => {
    dispatch({ type: 'connectionModal/open' })
  }, [])

  const closeConnectionModal = useCallback((): void => {
    dispatch({ type: 'connectionModal/close' })
  }, [])

  const selectConnection = useCallback(
    (connectionId: string): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'connection', connectionId } })
      void loadBuckets(connectionId)
    },
    [loadBuckets],
  )

  const selectBucket = useCallback(
    (connectionId: string, bucket: string): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'bucket', connectionId, bucket, prefix: '' } })
      void loadObjects(connectionId, bucket)
    },
    [loadObjects],
  )

  const selectPrefix = useCallback(
    (connectionId: string, bucket: string, prefix: string): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'bucket', connectionId, bucket, prefix } })
      void loadObjects(connectionId, bucket, prefix)
    },
    [loadObjects],
  )

  const selectObject = useCallback(
    (connectionId: string, bucket: string, key: string, prefix = ''): void => {
      dispatch({ type: 'selection/changed', selection: { type: 'object', connectionId, bucket, key, prefix } })
      void loadObjectMetadata(connectionId, bucket, key)
    },
    [loadObjectMetadata],
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
      void loadObjects(selection.connectionId, selection.bucket, selection.prefix ?? '')
    }
  }, [loadObjects])

  const refreshSelectedObjectMetadata = useCallback((): void => {
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

  const testConnectionConfig = useCallback(
    async (input: SaveObjectStorageConnectionInput): Promise<void> => {
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
    },
    [],
  )

  const deleteSelectedConnection = useCallback(async (): Promise<void> => {
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

  return (
    <AppShell
      state={state}
      onOpenConnectionModal={openConnectionModal}
      onCloseConnectionModal={closeConnectionModal}
      onRefreshConnections={() => void loadConnections()}
      onDeleteSelectedConnection={() => void deleteSelectedConnection()}
      onRefreshSelectedBuckets={refreshSelectedBuckets}
      onRefreshSelectedObjects={refreshSelectedObjects}
      onRefreshSelectedObjectMetadata={refreshSelectedObjectMetadata}
      onSelectConnection={selectConnection}
      onSelectBucket={selectBucket}
      onSelectPrefix={selectPrefix}
      onSelectObject={selectObject}
      onSaveConnection={(input) => void saveConnection(input)}
      onTestConnection={(input) => void testConnectionConfig(input)}
    />
  )
}

export function validateConnectionTestInput(input: SaveObjectStorageConnectionInput): string | undefined {
  if (!input.name.trim()) {
    return 'Connection name is required'
  }

  if (input.provider !== 'aws' && !input.endpoint) {
    return 'A custom endpoint is required for this S3-compatible provider'
  }

  if (!input.accessKeyId && !input.secretAccessKey) {
    return 'Access key ID and secret access key are required to test a connection'
  }

  if (input.accessKeyId && !input.secretAccessKey) {
    return 'Secret access key is required when access key ID is provided'
  }

  if (!input.accessKeyId && input.secretAccessKey) {
    return 'Access key ID is required when secret access key is provided'
  }

  return undefined
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

