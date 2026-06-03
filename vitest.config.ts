import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'main',
          environment: 'node',
          include: ['electron/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'renderer',
          environment: 'happy-dom',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
})
