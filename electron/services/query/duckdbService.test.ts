import { describe, expect, it } from 'vitest'
import { DuckDbService } from './duckdbService'

describe('DuckDbService', () => {
  const service = new DuckDbService()

  describe('runQuery', () => {
    it('returns empty result (placeholder)', async () => {
      const result = await service.runQuery({ sql: 'SELECT 1' })

      expect(result).toEqual({
        columns: [],
        rows: [],
        rowCount: 0,
      })
    })

    it('throws on empty SQL', async () => {
      await expect(service.runQuery({ sql: '' })).rejects.toThrow('Query SQL is required')
    })

    it('throws on whitespace-only SQL', async () => {
      await expect(service.runQuery({ sql: '   ' })).rejects.toThrow('Query SQL is required')
    })
  })
})
