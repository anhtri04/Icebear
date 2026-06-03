import { describe, expect, it } from 'vitest'
import { createS3Client } from './s3Client'

describe('createS3Client', () => {
  it('returns a client handle with provider and config', () => {
    const client = createS3Client({
      provider: 'aws',
      region: 'us-east-1',
    })

    expect(client).toEqual({
      provider: 'aws',
      region: 'us-east-1',
      endpoint: undefined,
      forcePathStyle: false,
    })
  })

  it('enables forcePathStyle for minio by default', () => {
    const client = createS3Client({
      provider: 'minio',
      endpoint: 'http://localhost:9000',
    })

    expect(client.forcePathStyle).toBe(true)
  })

  it('uses explicit forcePathStyle when provided', () => {
    const client = createS3Client({
      provider: 'aws',
      forcePathStyle: true,
    })

    expect(client.forcePathStyle).toBe(true)
  })
})
