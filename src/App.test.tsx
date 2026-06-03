import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders without throwing', () => {
    expect(() => App()).not.toThrow()
  })

  it('returns null (placeholder)', () => {
    expect(App()).toBeNull()
  })
})
