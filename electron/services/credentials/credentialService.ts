import { app } from 'electron'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { S3ConnectionConfig, S3Provider } from '../storage/s3Client'

export type ObjectStorageProvider = S3Provider

export interface ObjectStorageConnection extends S3ConnectionConfig {
  readonly id: string
  readonly name: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface RedactedObjectStorageConnection {
  readonly id: string
  readonly name: string
  readonly provider: ObjectStorageProvider
  readonly region?: string
  readonly endpoint?: string
  readonly accessKeyId?: string
  readonly hasSecretAccessKey: boolean
  readonly hasSessionToken: boolean
  readonly forcePathStyle?: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface SaveObjectStorageConnectionInput extends S3ConnectionConfig {
  readonly id?: string
  readonly name: string
}

interface CredentialStoreFile {
  readonly connections: ObjectStorageConnection[]
}

export class CredentialService {
  constructor(private readonly storePath?: string) {}

  async listConnections(): Promise<RedactedObjectStorageConnection[]> {
    const store = await this.readStore()
    return store.connections.map(redactConnection)
  }

  async getConnection(id: string): Promise<RedactedObjectStorageConnection> {
    return redactConnection(await this.resolveConnection(id))
  }

  async resolveConnection(id: string): Promise<ObjectStorageConnection> {
    const store = await this.readStore()
    const connection = store.connections.find((item) => item.id === id)

    if (!connection) {
      throw new Error('Connection not found')
    }

    return connection
  }

  async saveConnection(input: SaveObjectStorageConnectionInput): Promise<RedactedObjectStorageConnection> {
    const now = new Date().toISOString()
    const normalized = normalizeConnectionInput(input)
    const store = await this.readStore()
    const existingIndex = input.id
      ? store.connections.findIndex((connection) => connection.id === input.id)
      : -1

    const existing = existingIndex >= 0 ? store.connections[existingIndex] : undefined
    const connection: ObjectStorageConnection = {
      ...normalized,
      id: existing?.id ?? input.id ?? randomUUID(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    const connections = [...store.connections]
    if (existingIndex >= 0) {
      connections[existingIndex] = connection
    } else {
      connections.push(connection)
    }

    await this.writeStore({ connections })
    return redactConnection(connection)
  }

  async deleteConnection(id: string): Promise<void> {
    const store = await this.readStore()
    const connections = store.connections.filter((connection) => connection.id !== id)

    if (connections.length === store.connections.length) {
      throw new Error('Connection not found')
    }

    await this.writeStore({ connections })
  }

  private getStorePath(): string {
    return this.storePath ?? join(app.getPath('userData'), 'object-storage-connections.json')
  }

  private async readStore(): Promise<CredentialStoreFile> {
    try {
      const content = await readFile(this.getStorePath(), 'utf8')
      const parsed = JSON.parse(content) as Partial<CredentialStoreFile>

      return {
        connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      }
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return { connections: [] }
      }

      throw error
    }
  }

  private async writeStore(store: CredentialStoreFile): Promise<void> {
    const path = this.getStorePath()
    const temporaryPath = `${path}.tmp`

    await mkdir(dirname(path), { recursive: true })
    await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, path)
  }
}

function normalizeConnectionInput(input: SaveObjectStorageConnectionInput): Omit<ObjectStorageConnection, 'id' | 'createdAt' | 'updatedAt'> {
  const name = input.name.trim()

  if (!name) {
    throw new Error('Connection name is required')
  }

  if (input.provider !== 'aws' && !input.endpoint) {
    throw new Error('A custom endpoint is required for this S3-compatible provider')
  }

  if (input.accessKeyId && !input.secretAccessKey) {
    throw new Error('Secret access key is required when access key ID is provided')
  }

  if (!input.accessKeyId && input.secretAccessKey) {
    throw new Error('Access key ID is required when secret access key is provided')
  }

  return {
    name,
    provider: input.provider,
    region: input.region ?? resolveDefaultRegion(input.provider),
    endpoint: input.endpoint,
    accessKeyId: input.accessKeyId,
    secretAccessKey: input.secretAccessKey,
    sessionToken: input.sessionToken,
    forcePathStyle: input.forcePathStyle ?? defaultForcePathStyle(input.provider),
  }
}

function resolveDefaultRegion(provider: ObjectStorageProvider): string {
  return provider === 'r2' ? 'auto' : 'us-east-1'
}

function defaultForcePathStyle(provider: ObjectStorageProvider): boolean {
  return provider === 'minio'
}

function redactConnection(connection: ObjectStorageConnection): RedactedObjectStorageConnection {
  return {
    id: connection.id,
    name: connection.name,
    provider: connection.provider,
    region: connection.region,
    endpoint: connection.endpoint,
    accessKeyId: connection.accessKeyId,
    hasSecretAccessKey: Boolean(connection.secretAccessKey),
    hasSessionToken: Boolean(connection.sessionToken),
    forcePathStyle: connection.forcePathStyle,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

export const credentialService = new CredentialService()
