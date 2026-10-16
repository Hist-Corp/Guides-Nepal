import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ErrorBoundary from '../../components/ErrorBoundary';

// A component that throws during render to exercise the error boundary.
function Boom(): never {
  throw new Error('boom from render');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>all good</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('renders a fallback UI instead of crashing when a child throws', () => {
    // React logs the caught error via console.error; silence the expected noise.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    // The whole app must not white-screen: a friendly fallback is shown.
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // The original error message is surfaced for debugging.
    expect(screen.getByText(/boom from render/)).toBeInTheDocument();
  });

  it('offers a reload action in the fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
