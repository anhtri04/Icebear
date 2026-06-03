import { ipcMain } from 'electron'
import type { S3ConnectionConfig } from '../services/storage/s3Client'
import { storageService, type ListObjectsInput } from '../services/storage/storageService'

export function registerStorageIpcHandlers(): void {
  ipcMain.handle('storage:listBuckets', (_event, connection: S3ConnectionConfig) => {
    return storageService.listBuckets(connection)
  })

  ipcMain.handle('storage:listObjects', (_event, input: ListObjectsInput) => {
    return storageService.listObjects(input)
  })
}
