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

export interface S3ClientHandle {
  readonly provider: S3Provider
  readonly region?: string
  readonly endpoint?: string
  readonly forcePathStyle: boolean
}

export function createS3Client(config: S3ConnectionConfig): S3ClientHandle {
  return {
    provider: config.provider,
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle ?? config.provider === 'minio',
  }
}
