import { contextBridge, ipcRenderer } from 'electron'
import type {
  RedactedObjectStorageConnection,
  SaveObjectStorageConnectionInput,
} from './services/credentials/credentialService'
import type { DetectDatasetFormatInput, DatasetFormat } from './services/dataset/detectFormat'
import type { DatasetSchema, InferSchemaInput } from './services/dataset/inferSchema'
import type { DatasetPreview, PreviewDatasetInput } from './services/dataset/previewDataset'
import type { QueryRequest, QueryResult } from './services/query/duckdbService'
import type {
  GetObjectMetadataInput,
  ListBucketsInput,
  ListObjectsInput,
  ListObjectsResult,
  ObjectMetadata,
  StorageBucket,
  ValidateConnectionConfigInput,
  ValidateConnectionInput,
  ValidateConnectionResult,
} from './services/storage/storageService'

const electronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('app:ping'),
  credentials: {
    listConnections: (): Promise<RedactedObjectStorageConnection[]> => {
      return ipcRenderer.invoke('credentials:listConnections')
    },
    getConnection: (id: string): Promise<RedactedObjectStorageConnection> => {
      return ipcRenderer.invoke('credentials:getConnection', id)
    },
    saveConnection: (input: SaveObjectStorageConnectionInput): Promise<RedactedObjectStorageConnection> => {
      return ipcRenderer.invoke('credentials:saveConnection', input)
    },
    deleteConnection: (id: string): Promise<void> => {
      return ipcRenderer.invoke('credentials:deleteConnection', id)
    },
  },
  storage: {
    validateConnection: (input: ValidateConnectionInput): Promise<ValidateConnectionResult> => {
      return ipcRenderer.invoke('storage:validateConnection', input)
    },
    validateConnectionConfig: (input: ValidateConnectionConfigInput): Promise<ValidateConnectionResult> => {
      return ipcRenderer.invoke('storage:validateConnectionConfig', input)
    },
    listBuckets: (input: ListBucketsInput): Promise<StorageBucket[]> => {
      return ipcRenderer.invoke('storage:listBuckets', input)
    },
    listObjects: (input: ListObjectsInput): Promise<ListObjectsResult> => {
      return ipcRenderer.invoke('storage:listObjects', input)
    },
    getObjectMetadata: (input: GetObjectMetadataInput): Promise<ObjectMetadata> => {
      return ipcRenderer.invoke('storage:getObjectMetadata', input)
    },
  },
  dataset: {
    detectFormat: (input: DetectDatasetFormatInput): Promise<DatasetFormat> => {
      return ipcRenderer.invoke('dataset:detectFormat', input)
    },
    inferSchema: (input: InferSchemaInput): Promise<DatasetSchema> => {
      return ipcRenderer.invoke('dataset:inferSchema', input)
    },
    preview: (input: PreviewDatasetInput): Promise<DatasetPreview> => {
      return ipcRenderer.invoke('dataset:preview', input)
    },
  },
  query: {
    run: (request: QueryRequest): Promise<QueryResult> => {
      return ipcRenderer.invoke('query:run', request)
    },
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
