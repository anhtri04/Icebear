import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3'

export type S3Provider = 'aws' | 'r2' | 'minio' | 's3-compatible'

export interface S3ConnectionConfig {
  readonly provider: S3Provider
  readonly region?: string
  readonly endpoint?: string
  readonly accessKeyId?: string
  readonly secretAccessKey?: string
  readonly sessionToken?: string
  readonly forcePathStyle?: boolean
}

export function createS3Client(config: S3ConnectionConfig): S3Client {
  validateS3ConnectionConfig(config)

  const clientConfig: S3ClientConfig = {
    region: resolveRegion(config),
    forcePathStyle: config.forcePathStyle ?? config.provider === 'minio',
  }

  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint
  }

  if (config.accessKeyId && config.secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      sessionToken: config.sessionToken,
    }
  }

  return new S3Client(clientConfig)
}

function resolveRegion(config: S3ConnectionConfig): string {
  if (config.region) {
    return config.region
  }

  if (config.provider === 'r2') {
    return 'auto'
  }

  return 'us-east-1'  // return default region
}

function validateS3ConnectionConfig(config: S3ConnectionConfig): void {
  if (config.provider !== 'aws' && !config.endpoint) {
    throw new Error('A custom endpoint is required for this S3-compatible provider')
  }

  if (config.accessKeyId && !config.secretAccessKey) {
    throw new Error('Secret access key is required when access key ID is provided')
  }

  if (!config.accessKeyId && config.secretAccessKey) {
    throw new Error('Access key ID is required when secret access key is provided')
  }
}
