import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      '@': __dirname,
      '@config': `${__dirname}/config`,
      '@security': `${__dirname}/security`,
      '@shared': `${__dirname}/shared`,
      '@api': `${__dirname}/api`,
      '@core': `${__dirname}/core`,
      '@features': `${__dirname}/features`,
      '@infrastructure': `${__dirname}/infrastructure`,
      '@tests': `${__dirname}/tests`
    }
  }
}) 