import { describe, expect, it } from 'vitest'
import { inferSchema } from './inferSchema'

describe('inferSchema', () => {
  it('returns empty fields for no sample rows', () => {
    const result = inferSchema({ format: 'csv', sampleRows: [] })
    expect(result.format).toBe('csv')
    expect(result.fields).toEqual([])
  })

  it('infers string fields from sample data', () => {
    const result = inferSchema({
      format: 'json',
      sampleRows: [{ name: 'Alice' }, { name: 'Bob' }],
    })

    expect(result.fields).toEqual([
      { name: 'name', type: 'string', nullable: false },
    ])
  })

  it('infers mixed types as "unknown"', () => {
    const result = inferSchema({
      format: 'csv',
      sampleRows: [{ value: 42 }, { value: 'hello' }],
    })

    expect(result.fields).toEqual([
      { name: 'value', type: 'unknown', nullable: false },
    ])
  })

  it('marks field as nullable when value is null', () => {
    const result = inferSchema({
      format: 'json',
      sampleRows: [{ name: null }],
    })

    expect(result.fields).toEqual([
      { name: 'name', type: 'null', nullable: true },
    ])
  })

  it('detects date strings', () => {
    const result = inferSchema({
      format: 'csv',
      sampleRows: [{ created: '2024-01-15' }],
    })

    expect(result.fields).toEqual([
      { name: 'created', type: 'date', nullable: false },
    ])
  })

  it('detects various primitive types', () => {
    const result = inferSchema({
      format: 'json',
      sampleRows: [
        { num: 42, flag: true, items: [1, 2], obj: { a: 1 } },
      ],
    })

    const fields = new Map(result.fields.map(f => [f.name, f]))
    expect(fields.get('num')?.type).toBe('number')
    expect(fields.get('flag')?.type).toBe('boolean')
    expect(fields.get('items')?.type).toBe('array')
    expect(fields.get('obj')?.type).toBe('object')
  })
})
