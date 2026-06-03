import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockExposeInMainWorld = vi.fn()
const mockInvoke = vi.fn<(channel: string, ...args: unknown[]) => unknown>()

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld,
  },
  ipcRenderer: {
    invoke: (...args: [string, ...unknown[]]) => mockInvoke(...args),
  },
}))

describe('preload', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('exposes electronAPI via contextBridge', async () => {
    await import('./preload')

    expect(mockExposeInMainWorld).toHaveBeenCalledTimes(1)
    expect(mockExposeInMainWorld).toHaveBeenCalledWith(
      'electronAPI',
      expect.objectContaining({
        ping: expect.any(Function),
        storage: expect.objectContaining({
          listBuckets: expect.any(Function),
          listObjects: expect.any(Function),
        }),
        dataset: expect.objectContaining({
          detectFormat: expect.any(Function),
          inferSchema: expect.any(Function),
          preview: expect.any(Function),
        }),
        query: expect.objectContaining({
          run: expect.any(Function),
        }),
      }),
    )
  })

  it('ping invokes app:ping and returns result', async () => {
    mockInvoke.mockResolvedValue('pong')

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      ping: () => Promise<string>
    }
    const result = await api.ping()

    expect(mockInvoke).toHaveBeenCalledWith('app:ping')
    expect(result).toBe('pong')
  })

  it('storage.listBuckets delegates to ipcRenderer.invoke', async () => {
    const mockBuckets = [{ name: 'bucket1', createdAt: '2024-01-01' }]
    mockInvoke.mockResolvedValue(mockBuckets)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      storage: {
        listBuckets: (connection: { provider: string }) => Promise<unknown[]>
      }
    }
    const connection = { provider: 'aws' as const }
    const result = await api.storage.listBuckets(connection)

    expect(mockInvoke).toHaveBeenCalledWith('storage:listBuckets', connection)
    expect(result).toEqual(mockBuckets)
  })

  it('storage.listObjects delegates to ipcRenderer.invoke', async () => {
    const mockResult = { objects: [], prefixes: [] }
    mockInvoke.mockResolvedValue(mockResult)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      storage: { listObjects: (input: unknown) => Promise<unknown> }
    }
    const input = {
      connection: { provider: 'aws' },
      bucket: 'test',
    }
    const result = await api.storage.listObjects(input)

    expect(mockInvoke).toHaveBeenCalledWith('storage:listObjects', input)
    expect(result).toEqual(mockResult)
  })

  it('dataset.detectFormat delegates to ipcRenderer.invoke', async () => {
    mockInvoke.mockResolvedValue('csv')

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      dataset: { detectFormat: (input: unknown) => Promise<unknown> }
    }
    const input = { key: 'data.csv' }
    const result = await api.dataset.detectFormat(input)

    expect(mockInvoke).toHaveBeenCalledWith('dataset:detectFormat', input)
    expect(result).toBe('csv')
  })

  it('dataset.inferSchema delegates to ipcRenderer.invoke', async () => {
    const mockSchema = { format: 'csv', fields: [] }
    mockInvoke.mockResolvedValue(mockSchema)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      dataset: { inferSchema: (input: unknown) => Promise<unknown> }
    }
    const input = { format: 'csv', sampleRows: [] }
    const result = await api.dataset.inferSchema(input)

    expect(mockInvoke).toHaveBeenCalledWith('dataset:inferSchema', input)
    expect(result).toEqual(mockSchema)
  })

  it('dataset.preview delegates to ipcRenderer.invoke', async () => {
    const mockPreview = { bucket: 'b', key: 'k', format: 'csv', columns: [], rows: [], limit: 10 }
    mockInvoke.mockResolvedValue(mockPreview)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      dataset: { preview: (input: unknown) => Promise<unknown> }
    }
    const input = { bucket: 'b', key: 'k' }
    const result = await api.dataset.preview(input)

    expect(mockInvoke).toHaveBeenCalledWith('dataset:preview', input)
    expect(result).toEqual(mockPreview)
  })

  it('query.run delegates to ipcRenderer.invoke', async () => {
    const mockResult = { columns: [], rows: [], rowCount: 0 }
    mockInvoke.mockResolvedValue(mockResult)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      query: { run: (request: unknown) => Promise<unknown> }
    }
    const request = { sql: 'SELECT 1' }
    const result = await api.query.run(request)

    expect(mockInvoke).toHaveBeenCalledWith('query:run', request)
    expect(result).toEqual(mockResult)
  })
})
