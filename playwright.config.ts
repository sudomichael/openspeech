import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, fullyParallel: false,
  use: { baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3107', ...devices['Desktop Chrome'] },
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'npm run start -- --port 3107', url: 'http://localhost:3107', reuseExistingServer: true },
  reporter: 'list',
});
