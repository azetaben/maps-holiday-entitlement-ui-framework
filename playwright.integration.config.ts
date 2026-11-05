import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results/hook-integration',
  timeout: 90_000,
  workers: 1,
  reporter: [
    ['list'],
    ['junit', { outputFile: './reports/hook-integration-junit.xml' }],
    ['html', { outputFolder: './reports/hook-integration-html', open: 'never' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
