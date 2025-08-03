import { defineConfig } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig({
  testDir: '',
  testMatch: '*e2e.spec.ts',
  timeout: 60_000,
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:3000'
  },
  expect: {
    timeout: 5_000
  },
  workers: 4
})

