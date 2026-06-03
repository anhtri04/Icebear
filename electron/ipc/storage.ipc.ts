import { ipcMain } from 'electron'
import type { S3ConnectionConfig } from '../services/storage/s3Client'
import {
  storageService,
  type GetObjectMetadataInput,
  type ListObjectsInput,
} from '../services/storage/storageService'

export function registerStorageIpcHandlers(): void {
  ipcMain.handle('storage:validateConnection', (_event, connection: S3ConnectionConfig) => {
    return storageService.validateConnection(connection)
  })

  ipcMain.handle('storage:listBuckets', (_event, connection: S3ConnectionConfig) => {
    return storageService.listBuckets(connection)
  })

  ipcMain.handle('storage:listObjects', (_event, input: ListObjectsInput) => {
    return storageService.listObjects(input)
  })

  ipcMain.handle('storage:getObjectMetadata', (_event, input: GetObjectMetadataInput) => {
    return storageService.getObjectMetadata(input)
  })
}
