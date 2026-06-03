import { ipcMain } from 'electron'
import { duckDbService, type QueryRequest } from '../services/query/duckdbService'

export function registerQueryIpcHandlers(): void {
  ipcMain.handle('query:run', (_event, request: QueryRequest) => {
    return duckDbService.runQuery(request)
  })
}
