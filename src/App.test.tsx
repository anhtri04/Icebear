import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the Icebear shell markup', () => {
    expect(App()).toContain('Icebear')
    expect(App()).toContain('Connections')
    expect(App()).toContain('Connect to Object Storage')
  })
})
