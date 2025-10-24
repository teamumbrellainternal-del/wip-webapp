import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['api/**/*.ts'],
      exclude: [
        'api/**/*.test.ts',
        'api/**/types.ts',
        'api/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './api'),
    },
  },
})
