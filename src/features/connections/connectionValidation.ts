import type { SaveObjectStorageConnectionInput } from '../../../shared/credentialTypes'

export function validateConnectionTestInput(input: SaveObjectStorageConnectionInput): string | undefined {
  if (!input.name.trim()) {
    return 'Connection name is required'
  }

  if (input.provider !== 'aws' && !input.endpoint) {
    return 'A custom endpoint is required for this S3-compatible provider'
  }

  if (!input.accessKeyId && !input.secretAccessKey) {
    return 'Access key ID and secret access key are required to test a connection'
  }

  if (input.accessKeyId && !input.secretAccessKey) {
    return 'Secret access key is required when access key ID is provided'
  }

  if (!input.accessKeyId && input.secretAccessKey) {
    return 'Access key ID is required when secret access key is provided'
  }

  return undefined
}
