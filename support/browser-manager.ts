import {Browser, BrowserContext, BrowserType, chromium, firefox, webkit} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {getTestOptions} from '../test-options';
import {logger} from './logger';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

const browserTypes: Record<BrowserName, BrowserType> = { chromium, firefox, webkit };

export class BrowserManager {
  private static browser?: Browser;

  static async launch(): Promise<void> {
    if (this.browser?.isConnected()) return;

    const options = getTestOptions();
    const name = options.browser as BrowserName;
    const browserType = browserTypes[name];
    if (!browserType) {
      throw new Error(`Unsupported BROWSER "${name}". Choose chromium, firefox, or webkit.`);
    }
    logger.info('Launching shared %s browser (headless: %s)', name, options.headless);
    this.browser = await browserType.launch({
      headless: options.headless,
      ...(options.channel ? { channel: options.channel } : {}),
    });
  }

  static getBrowser(): Browser {
    if (!this.browser?.isConnected()) {
      throw new Error('BrowserManager.launch() must run before creating a browser context.');
    }
    return this.browser;
  }

  static async newContext(): Promise<BrowserContext> {
    const options = getTestOptions();
    const harFile = path.resolve(
      options.harDir,
      options.har === 'record'
        ? `holiday-calculator-${process.pid}-${Date.now()}.har`
        : 'holiday-calculator.har',
    );
    if (options.har !== 'off') await mkdir(options.harDir, { recursive: true });
    const context = await this.getBrowser().newContext({
      viewport: options.viewport,
      ...(options.har === 'record' ? { recordHar: { path: harFile } } : {}),
    });
    if (options.har === 'replay') {
      await context.routeFromHAR(harFile, { notFound: 'abort' });
      logger.info('Replaying browser traffic from %s', harFile);
    } else if (options.har === 'record') {
      logger.info('Recording browser traffic to %s', harFile);
    }
    return context;
  }

  static async close(): Promise<void> {
    if (!this.browser) return;
    logger.info('Closing shared browser');
    await this.browser.close();
    this.browser = undefined;
  }
}
