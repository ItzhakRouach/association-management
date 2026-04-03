import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const STORAGE_STATE = path.join(__dirname, 'tests/e2e/.auth.json')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ngo_manager" npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
})
