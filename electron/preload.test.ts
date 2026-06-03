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
        credentials: expect.objectContaining({
          listConnections: expect.any(Function),
          getConnection: expect.any(Function),
          saveConnection: expect.any(Function),
          deleteConnection: expect.any(Function),
        }),
        storage: expect.objectContaining({
          validateConnection: expect.any(Function),
          validateConnectionConfig: expect.any(Function),
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

  it('credentials.listConnections delegates to ipcRenderer.invoke', async () => {
    const mockConnections = [{ id: 'conn-1', name: 'AWS', provider: 'aws' }]
    mockInvoke.mockResolvedValue(mockConnections)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      credentials: { listConnections: () => Promise<unknown[]> }
    }
    const result = await api.credentials.listConnections()

    expect(mockInvoke).toHaveBeenCalledWith('credentials:listConnections')
    expect(result).toEqual(mockConnections)
  })

  it('credentials.getConnection delegates to ipcRenderer.invoke', async () => {
    const mockConnection = { id: 'conn-1', name: 'AWS', provider: 'aws' }
    mockInvoke.mockResolvedValue(mockConnection)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      credentials: { getConnection: (id: string) => Promise<unknown> }
    }
    const result = await api.credentials.getConnection('conn-1')

    expect(mockInvoke).toHaveBeenCalledWith('credentials:getConnection', 'conn-1')
    expect(result).toEqual(mockConnection)
  })

  it('credentials.saveConnection delegates to ipcRenderer.invoke', async () => {
    const mockConnection = { id: 'conn-1', name: 'AWS', provider: 'aws' }
    mockInvoke.mockResolvedValue(mockConnection)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      credentials: { saveConnection: (input: unknown) => Promise<unknown> }
    }
    const input = { name: 'AWS', provider: 'aws' }
    const result = await api.credentials.saveConnection(input)

    expect(mockInvoke).toHaveBeenCalledWith('credentials:saveConnection', input)
    expect(result).toEqual(mockConnection)
  })

  it('credentials.deleteConnection delegates to ipcRenderer.invoke', async () => {
    mockInvoke.mockResolvedValue(undefined)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      credentials: { deleteConnection: (id: string) => Promise<void> }
    }
    await api.credentials.deleteConnection('conn-1')

    expect(mockInvoke).toHaveBeenCalledWith('credentials:deleteConnection', 'conn-1')
  })

  it('storage.validateConnection delegates to ipcRenderer.invoke', async () => {
    const mockResult = { ok: true }
    mockInvoke.mockResolvedValue(mockResult)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      storage: { validateConnection: (input: unknown) => Promise<unknown> }
    }
    const input = { connectionId: 'conn-1' }
    const result = await api.storage.validateConnection(input)

    expect(mockInvoke).toHaveBeenCalledWith('storage:validateConnection', input)
    expect(result).toEqual(mockResult)
  })

  it('storage.validateConnectionConfig delegates to ipcRenderer.invoke', async () => {
    const mockResult = { ok: true }
    mockInvoke.mockResolvedValue(mockResult)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      storage: { validateConnectionConfig: (input: unknown) => Promise<unknown> }
    }
    const input = { provider: 'aws' }
    const result = await api.storage.validateConnectionConfig(input)

    expect(mockInvoke).toHaveBeenCalledWith('storage:validateConnectionConfig', input)
    expect(result).toEqual(mockResult)
  })

  it('storage.listBuckets delegates to ipcRenderer.invoke', async () => {
    const mockBuckets = [{ name: 'bucket1', createdAt: '2024-01-01' }]
    mockInvoke.mockResolvedValue(mockBuckets)

    await import('./preload')

    const api = mockExposeInMainWorld.mock.calls[0][1] as {
      storage: {
        listBuckets: (input: { connectionId: string }) => Promise<unknown[]>
      }
    }
    const input = { connectionId: 'conn-1' }
    const result = await api.storage.listBuckets(input)

    expect(mockInvoke).toHaveBeenCalledWith('storage:listBuckets', input)
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
      connectionId: 'conn-1',
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
