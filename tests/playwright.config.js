import { defineConfig, devices } from '@playwright/test';
import visualConfig from './visual-test-config.js';

export default defineConfig({
  testDir: './',
  timeout: 30000,
  fullyParallel: true,
//   forbidOnly: !!process.env.CI,
//   retries: process.env.CI ? 2 : 0,
//   workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Dynamically generate projects based on configuration
  projects: visualConfig.browsers
    .filter(browser => browser.enabled)
    .map(browser => ({
      name: browser.name,
      use: { ...devices[`Desktop ${browser.name.charAt(0).toUpperCase() + browser.name.slice(1)}`] },
    })),
  // Comment out the webServer configuration since it's causing issues
  // and we'll assume the server is already running
  /* webServer: {
    command: 'aem up',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  }, */
});
