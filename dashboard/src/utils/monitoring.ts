/**
 * Lightweight, dependency-free error monitoring.
 *
 * Captures unhandled errors and unhandled promise rejections and forwards them
 * to:
 *   1. The console (always), and
 *   2. An optional endpoint configured via `VITE_ERROR_ENDPOINT` (e.g. a Sentry
 *      tunnel, a Logflare/Datadog intake, or your own collector).
 *
 * Why no SDK? This keeps the bundle small and avoids committing to a specific
 * vendor. The payload shape below is deliberately Sentry-compatible, so you can
 * point `VITE_ERROR_ENDPOINT` at a Sentry SDK-less relay or drop the official
 * Sentry SDK in later without rework.
 *
 * Reporting uses `navigator.sendBeacon` (with a `fetch` fallback) so the request
 * survives page unload — critical for errors that crash a route.
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  ua: string;
  timestamp: string;
  /** Free-form tags, e.g. { app: 'dashboard', version: '...' }. */
  tags?: Record<string, string>;
}

const endpoint = (): string | undefined => {
  try {
    // `import.meta.env` is statically replaced by Vite at build time.
    return (import.meta as { env?: Record<string, string> }).env?.VITE_ERROR_ENDPOINT;
  } catch {
    return undefined;
  }
};

/** Build a serialisable report from any thrown value. */
export function toErrorReport(
  error: unknown,
  extra?: { componentStack?: string; tags?: Record<string, string> }
): ErrorReport {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    message: err.message,
    stack: err.stack,
    componentStack: extra?.componentStack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    tags: { app: 'dashboard', ...extra?.tags },
  };
}

/**
 * Report an error. Never throws and never blocks the UI — this must be safe to
 * call from an error boundary or a global handler.
 */
export function reportError(
  error: unknown,
  extra?: { componentStack?: string; tags?: Record<string, string> }
): void {
  const report = toErrorReport(error, extra);

  // 1. Always surface locally for developers.
  console.error('[dashboard:error]', report.message, error);

  // 2. Forward to the configured endpoint, if any.
  const url = endpoint();
  if (!url || typeof navigator === 'undefined') return;

  const body = JSON.stringify(report);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* reporting must never break the app */
    });
  } catch {
    /* ignore */
  }
}

let installed = false;

/**
 * Install global handlers for errors that escape React (e.g. thrown in event
 * handlers, timers, or async code). Idempotent — safe to call multiple times.
 * Errors caught by the React error boundary are additionally reported with a
 * component stack from `componentDidCatch`.
 */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, { tags: { source: 'window.onerror' } });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { tags: { source: 'unhandledrejection' } });
  });
}
