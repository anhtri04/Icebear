import { defineConfig } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve('electron/main.ts'),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve('electron/preload.ts'),
        output: {
          format: 'cjs',
          entryFileNames: 'preload.cjs',
        },
      },
    },
  },
  renderer: {
    root: '.',
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        input: resolve('index.html'),
      },
    },
  },
})
