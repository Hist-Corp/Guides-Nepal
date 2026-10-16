import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { reportError } from '../utils/monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary.
 *
 * React only supports catching render/lifecycle errors via a class component.
 * Without this, any unhandled error thrown while rendering a route bubbles to
 * the root and unmounts the whole tree, leaving a blank white screen. Wrapping
 * the app in this boundary means a failure in one page degrades to a friendly
 * fallback (with a reload action) instead of a full-app crash.
 *
 * Caught errors are forwarded to `utils/monitoring` (console + optional
 * `VITE_ERROR_ENDPOINT`) so production crashes are observable, not silent.
 *
 * Note: event-handler and async/promise errors are NOT caught here — those are
 * handled by `installGlobalErrorHandlers()` and per-call-site try/catch blocks.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, {
      componentStack: info.componentStack ?? undefined,
      tags: { source: 'react-error-boundary' },
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-dark p-6">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-surface p-8 text-center shadow-card">
            <h1 className="text-lg font-semibold text-ink-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-700">
              The dashboard hit an unexpected error and couldn&apos;t continue. You can try again,
              or reload the page.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-surface-dark p-3 text-left text-xs text-red-600">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                Try again
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface-dark"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
