import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()

vi.mock('./s3Client', () => ({
  createS3Client: vi.fn(() => ({ send: mockSend })),
}))

vi.mock('@aws-sdk/client-s3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aws-sdk/client-s3')>()

  return {
    ...actual,
    S3ServiceException: class S3ServiceException extends Error {
      readonly name: string

      constructor(options: { name: string; message: string }) {
        super(options.message)
        this.name = options.name
      }
    },
  }
})

import { S3ServiceException } from '@aws-sdk/client-s3'
import { StorageService } from './storageService'

describe('StorageService', () => {
  const service = new StorageService()

  beforeEach(() => {
    mockSend.mockReset()
  })

  describe('validateConnection', () => {
    it('returns ok when bucket listing succeeds', async () => {
      mockSend.mockResolvedValue({ Buckets: [] })

      const result = await service.validateConnection({ provider: 'aws' })

      expect(result).toEqual({ ok: true })
    })

    it('returns a sanitized message when bucket listing fails', async () => {
      mockSend.mockRejectedValue(
        new S3ServiceException({
          name: 'AccessDenied',
          message: 'raw access denied',
          $fault: 'client',
          $metadata: {},
        }),
      )

      const result = await service.validateConnection({ provider: 'aws' })

      expect(result).toEqual({
        ok: false,
        message: 'Unable to access object storage with the provided credentials',
      })
    })
  })

  describe('listBuckets', () => {
    it('normalizes S3 buckets', async () => {
      mockSend.mockResolvedValue({
        Buckets: [{ Name: 'bucket1', CreationDate: new Date('2024-01-01T00:00:00.000Z') }],
      })

      const result = await service.listBuckets({ provider: 'aws' })

      expect(result).toEqual([{ name: 'bucket1', createdAt: '2024-01-01T00:00:00.000Z' }])
    })
  })

  describe('listObjects', () => {
    it('normalizes S3 objects and common prefixes', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          {
            Key: 'folder/data.csv',
            Size: 123,
            LastModified: new Date('2024-01-02T00:00:00.000Z'),
            ETag: '"abc"',
          },
        ],
        CommonPrefixes: [{ Prefix: 'folder/nested/' }],
        NextContinuationToken: 'next-token',
      })

      const result = await service.listObjects({
        connection: { provider: 'aws' },
        bucket: 'test-bucket',
        prefix: 'folder/',
      })

      expect(result).toEqual({
        objects: [
          {
            bucket: 'test-bucket',
            key: 'folder/data.csv',
            size: 123,
            lastModified: '2024-01-02T00:00:00.000Z',
            etag: 'abc',
          },
        ],
        prefixes: ['folder/nested/'],
        continuationToken: 'next-token',
      })
    })
  })

  describe('getObjectMetadata', () => {
    it('normalizes head object metadata', async () => {
      mockSend.mockResolvedValue({
        ContentLength: 123,
        ContentType: 'text/csv',
        LastModified: new Date('2024-01-03T00:00:00.000Z'),
        ETag: '"def"',
        Metadata: { owner: 'icebear' },
      })

      const result = await service.getObjectMetadata({
        connection: { provider: 'aws' },
        bucket: 'test-bucket',
        key: 'data.csv',
      })

      expect(result).toEqual({
        bucket: 'test-bucket',
        key: 'data.csv',
        size: 123,
        contentType: 'text/csv',
        lastModified: '2024-01-03T00:00:00.000Z',
        etag: 'def',
        metadata: { owner: 'icebear' },
      })
    })
  })
})
