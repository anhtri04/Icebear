import { contextBridge, ipcRenderer } from 'electron'
import type { DetectDatasetFormatInput, DatasetFormat } from './services/dataset/detectFormat'
import type { DatasetSchema, InferSchemaInput } from './services/dataset/inferSchema'
import type { DatasetPreview, PreviewDatasetInput } from './services/dataset/previewDataset'
import type { QueryRequest, QueryResult } from './services/query/duckdbService'
import type { S3ConnectionConfig } from './services/storage/s3Client'
import type {
  GetObjectMetadataInput,
  ListObjectsInput,
  ListObjectsResult,
  ObjectMetadata,
  StorageBucket,
  ValidateConnectionResult,
} from './services/storage/storageService'

const electronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('app:ping'),
  storage: {
    validateConnection: (connection: S3ConnectionConfig): Promise<ValidateConnectionResult> => {
      return ipcRenderer.invoke('storage:validateConnection', connection)
    },
    listBuckets: (connection: S3ConnectionConfig): Promise<StorageBucket[]> => {
      return ipcRenderer.invoke('storage:listBuckets', connection)
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
