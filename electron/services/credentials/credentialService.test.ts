import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CredentialService } from './credentialService'

let tempDir: string
let service: CredentialService
let storePath: string

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'icebear-credentials-'))
  storePath = join(tempDir, 'connections.json')
  service = new CredentialService(storePath)
})

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true })
})

describe('CredentialService', () => {
  it('returns an empty list when the store does not exist', async () => {
    await expect(service.listConnections()).resolves.toEqual([])
  })

  it('saves and redacts object storage credentials', async () => {
    const connection = await service.saveConnection({
      name: 'Production AWS',
      provider: 'aws',
      region: 'us-east-1',
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
      sessionToken: 'session-token',
    })

    expect(connection).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Production AWS',
        provider: 'aws',
        region: 'us-east-1',
        accessKeyId: 'access-key',
        hasSecretAccessKey: true,
        hasSessionToken: true,
        forcePathStyle: false,
      }),
    )
    expect(connection).not.toHaveProperty('secretAccessKey')
    expect(connection).not.toHaveProperty('sessionToken')

    const stored = JSON.parse(await readFile(storePath, 'utf8')) as {
      connections: Array<{ secretAccessKey?: string }>
    }
    expect(stored.connections[0]?.secretAccessKey).toBe('secret-key')
  })

  it('resolves full credentials for main-process services only', async () => {
    const saved = await service.saveConnection({
      name: 'MinIO Local',
      provider: 'minio',
      endpoint: 'http://localhost:9000',
      accessKeyId: 'minio',
      secretAccessKey: 'password',
    })

    const resolved = await service.resolveConnection(saved.id)

    expect(resolved).toEqual(
      expect.objectContaining({
        id: saved.id,
        name: 'MinIO Local',
        provider: 'minio',
        endpoint: 'http://localhost:9000',
        region: 'us-east-1',
        forcePathStyle: true,
        secretAccessKey: 'password',
      }),
    )
  })

  it('updates an existing connection', async () => {
    const saved = await service.saveConnection({
      name: 'Old name',
      provider: 'aws',
      accessKeyId: 'old',
      secretAccessKey: 'old-secret',
    })

    const updated = await service.saveConnection({
      id: saved.id,
      name: 'New name',
      provider: 'aws',
      accessKeyId: 'new',
      secretAccessKey: 'new-secret',
    })

    expect(updated.id).toBe(saved.id)
    expect(updated.name).toBe('New name')
    expect(updated.createdAt).toBe(saved.createdAt)
    expect(updated.updatedAt >= saved.updatedAt).toBe(true)
    await expect(service.listConnections()).resolves.toHaveLength(1)
    await expect(service.resolveConnection(saved.id)).resolves.toEqual(
      expect.objectContaining({ accessKeyId: 'new', secretAccessKey: 'new-secret' }),
    )
  })

  it('deletes a connection', async () => {
    const saved = await service.saveConnection({ name: 'AWS', provider: 'aws' })

    await service.deleteConnection(saved.id)

    await expect(service.listConnections()).resolves.toEqual([])
    await expect(service.resolveConnection(saved.id)).rejects.toThrow('Connection not found')
  })

  it('requires endpoints for non-AWS providers', async () => {
    await expect(service.saveConnection({ name: 'R2', provider: 'r2' })).rejects.toThrow(
      'A custom endpoint is required',
    )
  })

  it('requires matching access key and secret key', async () => {
    await expect(
      service.saveConnection({ name: 'AWS', provider: 'aws', accessKeyId: 'access-key' }),
    ).rejects.toThrow('Secret access key is required')

    await expect(
      service.saveConnection({ name: 'AWS', provider: 'aws', secretAccessKey: 'secret-key' }),
    ).rejects.toThrow('Access key ID is required')
  })
})
