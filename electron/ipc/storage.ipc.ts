import { ipcMain } from 'electron'
import {
  storageService,
  type GetObjectMetadataInput,
  type ListBucketsInput,
  type ListObjectsInput,
  type ValidateConnectionConfigInput,
  type ValidateConnectionInput,
} from '../services/storage/storageService'

export function registerStorageIpcHandlers(): void {
  ipcMain.handle('storage:validateConnection', (_event, input: ValidateConnectionInput) => {
    return storageService.validateConnection(input)
  })

  ipcMain.handle('storage:validateConnectionConfig', (_event, input: ValidateConnectionConfigInput) => {
    return storageService.validateConnectionConfig(input)
  })

  ipcMain.handle('storage:listBuckets', (_event, input: ListBucketsInput) => {
    return storageService.listBuckets(input)
  })

  ipcMain.handle('storage:listObjects', (_event, input: ListObjectsInput) => {
    return storageService.listObjects(input)
  })

  ipcMain.handle('storage:getObjectMetadata', (_event, input: GetObjectMetadataInput) => {
    return storageService.getObjectMetadata(input)
  })
}
