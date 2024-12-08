import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@config': path.resolve(__dirname, './config'),
      '@security': path.resolve(__dirname, './security'),
      '@shared': path.resolve(__dirname, './shared'),
      '@api': path.resolve(__dirname, './api'),
      '@core': path.resolve(__dirname, './core'),
      '@features': path.resolve(__dirname, './features'),
      '@infrastructure': path.resolve(__dirname, './infrastructure'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
}) 