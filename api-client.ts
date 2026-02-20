/**
 * Shared API client for client-side requests.
 * Uses credentials, consistent error handling, and optional loading/error state.
 */

export type ApiClientOptions = RequestInit & {
  /** If provided, parse JSON body and return typed data */
  parseJson?: true;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

/** Fetch with credentials and optional JSON parse. Returns Result type. */
export async function apiFetch<T>(
  url: string,
  options: ApiClientOptions & { parseJson: true }
): Promise<ApiResult<T>>;
export async function apiFetch(
  url: string,
  options?: ApiClientOptions
): Promise<ApiResult<unknown>>;
export async function apiFetch<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<ApiResult<T>> {
  const { parseJson, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(typeof init.headers === 'object' && !(init.headers instanceof Headers)
      ? init.headers
      : {}),
  };
  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers,
    });
    const text = await res.text();
    let data: T | { error?: string } = null as T;
    try {
      data = text ? (JSON.parse(text) as T | { error?: string }) : ({} as T);
    } catch {
      if (!res.ok) {
        return { ok: false, error: res.statusText || 'Request failed', status: res.status };
      }
      return { ok: false, error: 'Invalid response', status: res.status };
    }
    if (!res.ok) {
      const errorMsg = data && typeof data === 'object' && 'error' in data && typeof (data as { error: string }).error === 'string'
        ? (data as { error: string }).error
        : res.statusText || 'Request failed';
      return { ok: false, error: errorMsg, status: res.status };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { ok: false, error: message };
  }
}

/** Helper: get error message from ApiResult */
export function getErrorMessage(result: ApiResult<unknown>): string {
  return result.ok ? '' : result.error;
}
