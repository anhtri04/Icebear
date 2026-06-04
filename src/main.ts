import './style.css'
import { App } from './App'
import type { SaveObjectStorageConnectionInput } from '../electron/services/credentials/credentialService'
import type { S3Provider } from '../electron/services/storage/s3Client'
import type { AppState } from './appTypes'
import { bucketNodeId } from './appTypes'

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('App root element not found')
}

const app = appRoot

let state: AppState = {
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

render()
void loadConnections()

function render(): void {
  app.innerHTML = App(state)
  bindEvents()
}

function setState(nextState: AppState): void {
  state = nextState
  render()
}

function bindEvents(): void {
  app.querySelectorAll<HTMLElement>('[data-action="open-connection-modal"]').forEach((element) => {
    element.addEventListener('click', () => {
      setState({ ...state, isConnectionModalOpen: true, statusMessage: undefined })
    })
  })

  app.querySelectorAll<HTMLElement>('[data-action="close-connection-modal"]').forEach((element) => {
    element.addEventListener('click', () => {
      setState({ ...state, isConnectionModalOpen: false, statusMessage: undefined })
    })
  })

  app.querySelector<HTMLElement>('[data-action="refresh-connections"]')?.addEventListener('click', () => {
    void loadConnections()
  })

  app.querySelector<HTMLElement>('[data-action="delete-selected-connection"]')?.addEventListener('click', () => {
    void deleteSelectedConnection()
  })

  app.querySelector<HTMLElement>('[data-action="refresh-selected-buckets"]')?.addEventListener('click', () => {
    if (state.selection.type === 'connection') {
      void loadBuckets(state.selection.connectionId)
    }
  })

  app.querySelector<HTMLElement>('[data-action="refresh-selected-objects"]')?.addEventListener('click', () => {
    if (state.selection.type === 'bucket') {
      void loadObjects(state.selection.connectionId, state.selection.bucket)
    }
  })

  app.querySelector<HTMLElement>('[data-action="test-connection-config"]')?.addEventListener('click', () => {
    const form = app.querySelector<HTMLFormElement>('#connection-form')
    if (form) {
      void testConnectionConfig(form)
    }
  })

  app.querySelector<HTMLFormElement>('#connection-form')?.addEventListener('submit', (event) => {
    event.preventDefault()
    void saveConnection(event.currentTarget as HTMLFormElement)
  })

  app.querySelectorAll<HTMLButtonElement>('[data-connection-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const connectionId = button.dataset.connectionId
      const bucket = button.dataset.bucketName

      if (!connectionId) {
        return
      }

      if (bucket) {
        setState({ ...state, selection: { type: 'bucket', connectionId, bucket } })
        void loadObjects(connectionId, bucket)
        return
      }

      setState({ ...state, selection: { type: 'connection', connectionId } })
      void loadBuckets(connectionId)
    })
  })
}

async function loadConnections(): Promise<void> {
  setState({ ...state, isLoadingConnections: true })

  try {
    const connections = await window.electronAPI.credentials.listConnections()
    setState({ ...state, connections, isLoadingConnections: false })
  } catch (error) {
    setState({
      ...state,
      isLoadingConnections: false,
      statusMessage: error instanceof Error ? error.message : 'Unable to load connections',
    })
  }
}

async function loadBuckets(connectionId: string): Promise<void> {
  if (state.loadingBucketConnectionIds.includes(connectionId)) {
    return
  }

  setState({
    ...state,
    loadingBucketConnectionIds: [...state.loadingBucketConnectionIds, connectionId],
    errorsByNodeId: { ...state.errorsByNodeId, [connectionId]: '' },
  })

  try {
    const buckets = await window.electronAPI.storage.listBuckets({ connectionId })
    setState({
      ...state,
      bucketsByConnectionId: { ...state.bucketsByConnectionId, [connectionId]: buckets },
      loadingBucketConnectionIds: state.loadingBucketConnectionIds.filter((id) => id !== connectionId),
    })
  } catch (error) {
    setState({
      ...state,
      loadingBucketConnectionIds: state.loadingBucketConnectionIds.filter((id) => id !== connectionId),
      errorsByNodeId: { ...state.errorsByNodeId, [connectionId]: errorMessage(error, 'Unable to list buckets') },
    })
  }
}

async function loadObjects(connectionId: string, bucket: string): Promise<void> {
  const id = bucketNodeId(connectionId, bucket)

  if (state.loadingObjectBucketIds.includes(id)) {
    return
  }

  setState({
    ...state,
    loadingObjectBucketIds: [...state.loadingObjectBucketIds, id],
    errorsByNodeId: { ...state.errorsByNodeId, [id]: '' },
  })

  try {
    const result = await window.electronAPI.storage.listObjects({ connectionId, bucket })
    setState({
      ...state,
      objectsByBucketId: { ...state.objectsByBucketId, [id]: result },
      loadingObjectBucketIds: state.loadingObjectBucketIds.filter((item) => item !== id),
    })
  } catch (error) {
    setState({
      ...state,
      loadingObjectBucketIds: state.loadingObjectBucketIds.filter((item) => item !== id),
      errorsByNodeId: { ...state.errorsByNodeId, [id]: errorMessage(error, 'Unable to list objects') },
    })
  }
}

async function saveConnection(form: HTMLFormElement): Promise<void> {
  const input = formToConnectionInput(form)

  try {
    await window.electronAPI.credentials.saveConnection(input)
    setState({ ...state, isConnectionModalOpen: false, statusMessage: 'Connection saved' })
    await loadConnections()
  } catch (error) {
    setState({ ...state, isConnectionModalOpen: true, statusMessage: errorMessage(error, 'Unable to save connection') })
  }
}

async function testConnectionConfig(form: HTMLFormElement): Promise<void> {
  const input = formToConnectionInput(form)

  try {
    const result = await window.electronAPI.storage.validateConnectionConfig(input)
    setState({
      ...state,
      isConnectionModalOpen: true,
      statusMessage: result.ok ? 'Connection test succeeded' : result.message ?? 'Connection test failed',
    })
  } catch (error) {
    setState({ ...state, isConnectionModalOpen: true, statusMessage: errorMessage(error, 'Connection test failed') })
  }
}

async function deleteSelectedConnection(): Promise<void> {
  const connectionId = state.selection.type === 'none' ? undefined : state.selection.connectionId

  if (!connectionId || !confirm('Delete this connection?')) {
    return
  }

  try {
    await window.electronAPI.credentials.deleteConnection(connectionId)
    setState({
      ...state,
      selection: { type: 'none' },
      bucketsByConnectionId: removeKey(state.bucketsByConnectionId, connectionId),
      connections: state.connections.filter((connection) => connection.id !== connectionId),
    })
  } catch (error) {
    setState({ ...state, statusMessage: errorMessage(error, 'Unable to delete connection') })
  }
}

function formToConnectionInput(form: HTMLFormElement): SaveObjectStorageConnectionInput {
  const data = new FormData(form)
  const provider = String(data.get('provider') ?? 'aws') as S3Provider

  return {
    name: String(data.get('name') ?? '').trim(),
    provider,
    region: optionalString(data.get('region')),
    endpoint: optionalString(data.get('endpoint')),
    accessKeyId: optionalString(data.get('accessKeyId')),
    secretAccessKey: optionalString(data.get('secretAccessKey')),
    sessionToken: optionalString(data.get('sessionToken')),
    forcePathStyle: data.get('forcePathStyle') === 'on' ? true : undefined,
  }
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const normalized = String(value ?? '').trim()
  return normalized || undefined
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function removeKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}
