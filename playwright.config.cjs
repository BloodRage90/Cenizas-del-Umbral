const { defineConfig, devices } = require('@playwright/test');
const fs = require('node:fs');

const port = Number(process.env.PORT || 4173);
const systemChrome =
  process.env.PLAYWRIGHT_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const launchOptions = fs.existsSync(systemChrome) ? { executablePath: systemChrome } : undefined;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    launchOptions,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // System Chrome is enough for local QA; video is opt-in because Playwright's
    // bundled ffmpeg is not guaranteed to be available in a clean checkout.
    video: process.env.PLAYWRIGHT_VIDEO === 'on' ? 'retain-on-failure' : 'off',
  },
  webServer: {
    command: 'node scripts/serve.cjs',
    url: `http://127.0.0.1:${port}/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'landscape-844',
      use: { ...devices['Desktop Chrome'], viewport: { width: 844, height: 390 } },
    },
    {
      name: 'landscape-667',
      use: { ...devices['Desktop Chrome'], viewport: { width: 667, height: 375 } },
    },
    { name: 'mobile-390', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } },
  ],
});
