import {getTestOptions} from '../test-options';

/** Build a calculator route from the configured target so tests also work on local deployments. */
export function calculatorPath(suffix = ''): string {
  const basePath = new URL(getTestOptions().baseURL).pathname.replace(/\/+$/, '');
  const normalizedSuffix = suffix.replace(/^\/+|\/+$/g, '');
  const root = basePath || '/';
  if (!normalizedSuffix) return root;
  return `${root === '/' ? '' : root}/${normalizedSuffix}`;
}

export function calculatorUrl(suffix = ''): string {
  return new URL(calculatorPath(suffix), getTestOptions().baseURL).toString();
}
