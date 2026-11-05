const REQUIRED_SUBRESOURCE_TYPES = new Set(['script', 'stylesheet', 'xhr', 'fetch']);

export type ExpectedApiError = {
  path: string;
  status: number;
};

/** Add exact path/status pairs here only when the application intentionally returns API errors. */
export const EXPECTED_FIRST_PARTY_API_ERRORS: readonly ExpectedApiError[] = [];

function isSameOrigin(url: string, serviceOrigin: string): boolean {
  try {
    return new URL(url).origin === serviceOrigin;
  } catch {
    return false;
  }
}

export function isRequiredFirstPartyRequestFailure(
  url: string,
  resourceType: string,
  serviceOrigin: string,
): boolean {
  return (
    isSameOrigin(url, serviceOrigin) &&
    (resourceType === 'document' || REQUIRED_SUBRESOURCE_TYPES.has(resourceType))
  );
}

export function isRequiredFirstPartyHttpFailure(
  url: string,
  resourceType: string,
  status: number,
  serviceOrigin: string,
  expectedApiErrors: readonly ExpectedApiError[] = EXPECTED_FIRST_PARTY_API_ERRORS,
): boolean {
  if (!isSameOrigin(url, serviceOrigin)) return false;
  if (resourceType === 'xhr' || resourceType === 'fetch') {
    const pathname = new URL(url).pathname;
    if (
      expectedApiErrors.some((expected) => expected.status === status && expected.path === pathname)
    ) {
      return false;
    }
  }
  if (REQUIRED_SUBRESOURCE_TYPES.has(resourceType)) return status >= 400;
  // A 4xx document can be an intentional negative journey; server errors are unexpected.
  return resourceType === 'document' && status >= 500;
}
