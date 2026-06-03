import { ipcMain } from 'electron'
import { detectFormat, type DetectDatasetFormatInput } from '../services/dataset/detectFormat'
import { inferSchema, type InferSchemaInput } from '../services/dataset/inferSchema'
import { previewDataset, type PreviewDatasetInput } from '../services/dataset/previewDataset'

export function registerDatasetIpcHandlers(): void {
  ipcMain.handle('dataset:detectFormat', (_event, input: DetectDatasetFormatInput) => {
    return detectFormat(input)
  })

  ipcMain.handle('dataset:inferSchema', (_event, input: InferSchemaInput) => {
    return inferSchema(input)
  })

  ipcMain.handle('dataset:preview', (_event, input: PreviewDatasetInput) => {
    return previewDataset(input)
  })
}
