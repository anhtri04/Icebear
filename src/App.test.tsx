import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App, validateConnectionTestInput } from './App'

describe('App', () => {
  it('renders the Icebear shell markup', () => {
    const markup = renderToString(<App />)

    expect(markup).toContain('Icebear')
    expect(markup).toContain('Connections')
    expect(markup).toContain('Connect to Object Storage')
  })
})

describe('validateConnectionTestInput', () => {
  it('rejects an empty connection form before storage validation', () => {
    expect(validateConnectionTestInput({ name: '', provider: 'aws' })).toBe('Connection name is required')
  })

  it('requires explicit credentials for connection tests', () => {
    expect(validateConnectionTestInput({ name: 'AWS', provider: 'aws' })).toBe(
      'Access key ID and secret access key are required to test a connection',
    )
  })

  it('accepts a complete AWS test input', () => {
    expect(
      validateConnectionTestInput({
        name: 'AWS',
        provider: 'aws',
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      }),
    ).toBeUndefined()
  })
})
