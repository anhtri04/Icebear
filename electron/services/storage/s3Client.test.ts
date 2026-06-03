import { S3Client } from '@aws-sdk/client-s3'
import { describe, expect, it } from 'vitest'
import { createS3Client } from './s3Client'

describe('createS3Client', () => {
  it('returns an AWS SDK S3 client', () => {
    const client = createS3Client({
      provider: 'aws',
      region: 'us-east-1',
    })

    expect(client).toBeInstanceOf(S3Client)
  })

  it('requires endpoints for non-AWS providers', () => {
    expect(() => createS3Client({ provider: 'minio' })).toThrow(
      'A custom endpoint is required for this S3-compatible provider',
    )
  })

  it('requires complete static credential pairs', () => {
    expect(() =>
      createS3Client({
        provider: 'aws',
        accessKeyId: 'access-key',
      }),
    ).toThrow('Secret access key is required when access key ID is provided')
  })
})
