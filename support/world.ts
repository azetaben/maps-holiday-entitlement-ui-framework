import {IWorldOptions, setWorldConstructor, World} from '@cucumber/cucumber';
import {Browser, BrowserContext, Page} from '@playwright/test';
import {mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {PageManager} from '../pages/base/page-manager';
import {BrowserManager} from './browser-manager';
import {getTestOptions} from '../test-options';
import {logger} from './logger';
import type {JourneyTestData} from '../test_data/Fixtures';
import {isRequiredFirstPartyHttpFailure, isRequiredFirstPartyRequestFailure} from './diagnostics';

export class TestWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  pages!: PageManager;
  readonly browserDiagnostics: string[] = [];
  readonly requiredResourceDiagnostics: string[] = [];
  attemptNumber = 0;
  readonly pageLoadMeasurements: Array<{
    page: string;
    url: string;
    responseEndMs: number;
    domContentLoadedMs: number;
    loadEventEndMs: number;
  }> = [];
  readonly keyboardJourney: { controls: string[]; visibleIndicators: boolean[] } = {
    controls: [],
    visibleIndicators: [],
  };
  testData?: JourneyTestData;
  private traceStarted = false;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async startBrowser(): Promise<void> {
    const options = getTestOptions();
    const serviceOrigin = new URL(options.baseURL).origin;
    this.browser = BrowserManager.getBrowser();
    this.context = await BrowserManager.newContext();
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(options.actionTimeout);
    this.page.setDefaultNavigationTimeout(options.navigationTimeout);
    this.pages = new PageManager(this.page);
    if (options.trace !== 'off' && (options.trace !== 'on-first-retry' || this.attemptNumber > 0)) {
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
      this.traceStarted = true;
    }
    this.page.on('console', (message) => {
      if (message.type() === 'error') {
        this.browserDiagnostics.push(`Console error: ${message.text()}`);
        logger.error('Browser console: %s', message.text());
      }
    });
    this.page.on('pageerror', (error) => {
      this.browserDiagnostics.push(`Page error: ${error.stack ?? error.message}`);
      logger.error('Browser page error: %s', error.stack ?? error.message);
    });
    this.page.on('requestfailed', (request) => {
      const diagnostic = `Request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown error'})`;
      this.browserDiagnostics.push(diagnostic);
      if (
        isRequiredFirstPartyRequestFailure(request.url(), request.resourceType(), serviceOrigin)
      ) {
        this.requiredResourceDiagnostics.push(diagnostic);
      }
      logger.warn(
        'Request failed: %s %s (%s)',
        request.method(),
        request.url(),
        request.failure()?.errorText,
      );
    });
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        const diagnostic = `HTTP ${response.status()}: ${response.url()}`;
        this.browserDiagnostics.push(diagnostic);
        if (
          isRequiredFirstPartyHttpFailure(
            response.url(),
            response.request().resourceType(),
            response.status(),
            serviceOrigin,
          )
        ) {
          this.requiredResourceDiagnostics.push(diagnostic);
        }
        logger.warn('HTTP %s: %s', response.status(), response.url());
      }
    });
  }

  async finishTrace(name: string, keep: boolean): Promise<void> {
    if (!this.traceStarted || !this.context) return;
    this.traceStarted = false;
    if (!keep) {
      await this.context.tracing.stop();
      return;
    }
    const safeName = name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'scenario';
    await mkdir(getTestOptions().artifactsDir, { recursive: true });
    const tracePath = path.resolve(
      getTestOptions().artifactsDir,
      `${safeName}-${process.pid}-${Date.now()}.zip`,
    );
    await this.context.tracing.stop({ path: tracePath });
    this.attach(await readFile(tracePath), {
      mediaType: 'application/zip',
      fileName: path.basename(tracePath),
    });
  }

  async stopBrowser(): Promise<void> {
    logger.info('Closing scenario browser context');
    await this.context?.close();
  }
}

setWorldConstructor(TestWorld);
