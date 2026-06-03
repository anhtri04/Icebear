import { ipcMain } from 'electron'
import { registerDatasetIpcHandlers } from './dataset.ipc'
import { registerQueryIpcHandlers } from './query.ipc'
import { registerStorageIpcHandlers } from './storage.ipc'

export function registerIpcHandlers(): void {
  ipcMain.handle('app:ping', () => 'pong')

  registerStorageIpcHandlers()
  registerDatasetIpcHandlers()
  registerQueryIpcHandlers()
}
