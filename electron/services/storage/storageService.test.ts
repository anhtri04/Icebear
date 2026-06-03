import { describe, expect, it } from 'vitest'
import { StorageService } from './storageService'

describe('StorageService', () => {
  const service = new StorageService()

  describe('listBuckets', () => {
    it('returns an empty array (placeholder)', async () => {
      const result = await service.listBuckets({
        provider: 'aws',
        region: 'us-east-1',
      })

      expect(result).toEqual([])
    })
  })

  describe('listObjects', () => {
    it('returns empty results (placeholder)', async () => {
      const result = await service.listObjects({
        connection: { provider: 'aws', region: 'us-east-1' },
        bucket: 'test-bucket',
      })

      expect(result).toEqual({
        objects: [],
        prefixes: [],
      })
    })
  })
})
