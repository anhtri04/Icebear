import { ipcMain } from 'electron'
import {
  credentialService,
  type SaveObjectStorageConnectionInput,
} from '../services/credentials/credentialService'

export function registerCredentialIpcHandlers(): void {
  ipcMain.handle('credentials:listConnections', () => {
    return credentialService.listConnections()
  })

  ipcMain.handle('credentials:getConnection', (_event, id: string) => {
    return credentialService.getConnection(id)
  })

  ipcMain.handle('credentials:saveConnection', (_event, input: SaveObjectStorageConnectionInput) => {
    return credentialService.saveConnection(input)
  })

  ipcMain.handle('credentials:deleteConnection', (_event, id: string) => {
    return credentialService.deleteConnection(id)
  })
}
