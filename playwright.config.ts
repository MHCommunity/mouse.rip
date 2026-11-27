import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests against a production build. Run `bun run build` first; `bun run test:e2e` then starts the
 * built site on port 3100. To test a server that's already running (`bun run dev`, say), set
 * E2E_BASE_URL=http://localhost:3000.
 */
const external = process.env.E2E_BASE_URL;
const baseURL = external ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
  },
  webServer: external
    ? undefined
    : {
        command: 'bunx next start -p 3100',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
