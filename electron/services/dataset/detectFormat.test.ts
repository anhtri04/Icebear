import { describe, expect, it } from 'vitest'
import { detectFormat } from './detectFormat'

describe('detectFormat', () => {
  it('returns "parquet" for .parquet extension', () => {
    expect(detectFormat({ key: 'data.parquet' })).toBe('parquet')
    expect(detectFormat({ key: 'path/to/file.parquet' })).toBe('parquet')
  })

  it('returns "jsonl" for .jsonl and .ndjson extensions', () => {
    expect(detectFormat({ key: 'data.jsonl' })).toBe('jsonl')
    expect(detectFormat({ key: 'data.ndjson' })).toBe('jsonl')
  })

  it('returns "json" for .json extension or application/json content type', () => {
    expect(detectFormat({ key: 'data.json' })).toBe('json')
    expect(detectFormat({ key: 'data.txt', contentType: 'application/json' })).toBe('json')
  })

  it('returns "csv" for .csv extension or text/csv content type', () => {
    expect(detectFormat({ key: 'data.csv' })).toBe('csv')
    expect(detectFormat({ key: 'data.txt', contentType: 'text/csv' })).toBe('csv')
  })

  it('returns "unknown" for unrecognized formats', () => {
    expect(detectFormat({ key: 'data.txt' })).toBe('unknown')
    expect(detectFormat({ key: 'data' })).toBe('unknown')
  })

  it('is case-insensitive', () => {
    expect(detectFormat({ key: 'DATA.CSV' })).toBe('csv')
    expect(detectFormat({ key: 'Data.Json' })).toBe('json')
  })
})
