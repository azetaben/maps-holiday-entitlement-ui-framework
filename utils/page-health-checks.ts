import {Page} from '@playwright/test';
import frameworkConfig from '../config/framework.json';

export interface PageFinding {
  element: string;
  issue: string;
  url?: string;
}

type LinkRecord = { href: string | null; text: string; target: string };
type ImageRecord = {
  src: string;
  alt: string | null;
  complete: boolean;
  naturalWidth: number;
  visible: boolean;
};

/** Checks links on the current page, including same-page fragments and HTTP responses. */
export async function checkBrokenLinks(page: Page): Promise<PageFinding[]> {
  const links: LinkRecord[] = await page.locator('a').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute('href'),
      text: anchor.textContent?.trim() ?? '',
      target: anchor.outerHTML.slice(0, 180),
    })),
  );
  const findings: PageFinding[] = [];
  const checked = new Set<string>();
  const pendingRequests: Array<{ url: string; label: string }> = [];

  for (const link of links) {
    const label = link.text || link.href || '(unnamed link)';
    if (!link.href?.trim()) {
      findings.push({ element: link.target, issue: 'Link has no href.', url: page.url() });
      continue;
    }

    let url: URL;
    try {
      url = new URL(link.href, page.url());
    } catch {
      findings.push({ element: label, issue: 'Link URL is invalid.', url: link.href });
      continue;
    }

    if (url.protocol === 'mailto:' || url.protocol === 'tel:' || url.protocol === 'javascript:') {
      if (url.protocol === 'javascript:') {
        findings.push({
          element: label,
          issue: 'JavaScript URL is not a navigable link.',
          url: link.href,
        });
      }
      continue;
    }
    if (!['http:', 'https:'].includes(url.protocol)) continue;

    if (
      url.origin === new URL(page.url()).origin &&
      url.pathname === new URL(page.url()).pathname &&
      url.hash
    ) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      const exists = await page.evaluate(
        (id) => Boolean(document.getElementById(id) || document.getElementsByName(id).length),
        fragment,
      );
      if (!exists)
        findings.push({ element: label, issue: 'In-page target does not exist.', url: url.href });
      continue;
    }

    const requestUrl = url.href;
    if (checked.has(requestUrl)) continue;
    checked.add(requestUrl);
    pendingRequests.push({ url: requestUrl, label });
  }

  let nextRequest = 0;
  const verifyLinks = async () => {
    while (nextRequest < pendingRequests.length) {
      const { url, label } = pendingRequests[nextRequest++];
      try {
        let response = await page.request.fetch(url, {
          method: 'HEAD',
          timeout: frameworkConfig.timeouts.healthRequest,
        });
        if (response.status() === 405 || response.status() === 501) {
          response = await page.request.get(url, {
            timeout: frameworkConfig.timeouts.healthRequest,
          });
        }
        if (!response.ok()) {
          findings.push({ element: label, issue: `Link returned HTTP ${response.status()}.`, url });
        }
      } catch (error) {
        findings.push({
          element: label,
          issue: `Link could not be verified: ${error instanceof Error ? error.message : String(error)}`,
          url,
        });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, pendingRequests.length) }, verifyLinks));
  return findings;
}

/** Checks that buttons are visible, enabled, and have an accessible name. */
export async function checkButtons(page: Page): Promise<PageFinding[]> {
  const buttons = await page
    .locator(
      'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return Boolean(
            element.getClientRects().length &&
              style.visibility !== 'hidden' &&
              style.display !== 'none',
          );
        })
        .map((element) => {
          const htmlElement = element as HTMLButtonElement;
          const labelledBy = htmlElement.getAttribute('aria-labelledby');
          const inlineHandler = htmlElement.getAttribute('onclick');
          const functionName = inlineHandler?.match(/\b([A-Za-z_$][\w$]*)\s*\(/)?.[1];
          const labelledByText = labelledBy
            ?.split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
            .join(' ');
          return {
            label:
              htmlElement.getAttribute('aria-label')?.trim() ||
              labelledByText?.trim() ||
              htmlElement.innerText?.trim() ||
              htmlElement.getAttribute('value')?.trim() ||
              htmlElement.getAttribute('title')?.trim() ||
              '',
            type: htmlElement.getAttribute('type') ?? htmlElement.tagName.toLowerCase(),
            disabled:
              htmlElement.hasAttribute('disabled') ||
              htmlElement.getAttribute('aria-disabled') === 'true',
            visible: Boolean(
              htmlElement.getClientRects().length &&
                getComputedStyle(htmlElement).visibility !== 'hidden',
            ),
            target: htmlElement.outerHTML.slice(0, 180),
            invalidInlineHandler:
              functionName &&
              !['if', 'for', 'while', 'switch', 'function'].includes(functionName) &&
              typeof (window as unknown as Record<string, unknown>)[functionName] !== 'function'
                ? functionName
                : null,
          };
        }),
    );

  const findings: PageFinding[] = [];
  buttons.forEach((button, index) => {
    const name = button.label || `Button ${index + 1}`;
    if (!button.label)
      findings.push({ element: button.target, issue: `${name} has no accessible name.` });
    if (button.disabled) findings.push({ element: name, issue: 'Button is disabled.' });
    if (button.invalidInlineHandler) {
      findings.push({
        element: name,
        issue: `Button calls undefined handler ${button.invalidInlineHandler}().`,
      });
    }
  });
  return findings;
}

/** Checks that images load successfully and provide an alt attribute (empty is valid for decorative images). */
export async function checkImages(page: Page): Promise<PageFinding[]> {
  const images: ImageRecord[] = await page.locator('img').evaluateAll((elements) =>
    elements.map((element) => {
      const image = element as HTMLImageElement;
      return {
        src: image.currentSrc || image.src,
        alt: image.getAttribute('alt'),
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        visible: Boolean(
          image.getClientRects().length && getComputedStyle(image).visibility !== 'hidden',
        ),
      };
    }),
  );
  const findings: PageFinding[] = [];
  images.forEach((image, index) => {
    if (!image.visible) return;
    const name = image.src || `Image ${index + 1}`;
    if (!image.complete || image.naturalWidth === 0) {
      findings.push({ element: name, issue: 'Image failed to load.' });
    }
    if (image.alt === null) {
      findings.push({ element: name, issue: 'Image has no alt attribute.' });
    }
  });
  return findings;
}
