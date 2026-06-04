import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the Icebear shell markup', () => {
    const markup = renderToString(<App />)

    expect(markup).toContain('Icebear')
    expect(markup).toContain('Connections')
    expect(markup).toContain('Connect to Object Storage')
  })
})
